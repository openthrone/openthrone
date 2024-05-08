import type { NextApiRequest, NextApiResponse } from 'next';

import { BattleUpgrades, ItemTypes } from '@/constants';
import prisma from '@/lib/prisma';
import UserModel from '@/models/Users';
import { stringifyObj } from '@/utils/numberFormatting';

interface EquipmentProps {
  type: string;
  level: number;
  quantity: number | string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, items: itemsToEquip, operation = 'buy' } = req.body;
  if (!userId || !Array.isArray(itemsToEquip) || !['buy', 'sell'].includes(operation)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const uModel = new UserModel(user);
    let totalCost = 0;

    // Validate the items and calculate total cost
    for (const itemData of itemsToEquip) {
      const item = BattleUpgrades.find(
        (w) =>
          w.type === itemData.type &&
          w.level === itemData.level
      );
      if (itemData.quantity < 0) {
        return res.status(400).json({ error: 'Invalid quantity' });
      }
      if (!item) {
        return res
          .status(400)
          .json({ error: `Invalid item type, usage, or level` });
      }
      const itemCost =
        (item.cost - ((uModel.priceBonus || 0) / 100) * item.cost) *
        itemData.quantity;
      console.log('operation', operation)
      if (operation === 'buy') {
        totalCost += itemCost;
      } else { // selling items
        totalCost -= itemCost;
      }
    }

    // Check if the user has enough gold
    if (operation === 'buy' && user.gold < totalCost) {
      return res.status(400).json({ error: 'Not enough gold' });
    }

    // Deduct gold and equip items
    const updatedItems = user.battle_upgrades.map((userItem: EquipmentProps) => {
      const itemToEquip = itemsToEquip.find(
        (item) => item.type === userItem.type && item.level === userItem.level
      );
      if (itemToEquip) {
        const newQuantity = operation === 'buy' ?
          userItem.quantity + itemToEquip.quantity : // increase item quantity when buying
          userItem.quantity - itemToEquip.quantity; // decrease item quantity when selling

        if (newQuantity < 0) {
          return res.status(400).json({ error: 'Cannot have negative quantity' });
        }

        return { ...userItem, quantity: newQuantity };
      }
      return userItem;
    });

    // Add new items to the inventory if they don't exist
    itemsToEquip.forEach((itemData) => {
      if (
        !updatedItems.some(
          (i: EquipmentProps) =>
            i.type === itemData.type &&
            i.level === itemData.level,
        )
      ) {
        updatedItems.push({
          type: itemData.type,
          level: itemData.level,
          quantity: itemData.quantity,
        });
      }
    });

    // Update the user's gold and items in the database
    await prisma.users.update({
      where: { id: userId },
      data: {
        gold: BigInt(user.gold) - BigInt(totalCost),
        battle_upgrades: updatedItems,
      },
    });
    console.log('updatedItems', updatedItems);

    return res.status(200).json({
      message: 'Items equipped successfully',
      data: updatedItems,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to equip items' });
  }
}