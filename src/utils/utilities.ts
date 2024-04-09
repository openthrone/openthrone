import { levelXPArray, UnitTypes } from '@/constants';
import type { UnitType } from '@/types/typings';

/**
   * Returns the name of a unit based on its type and level.
   * @param type - The type of the unit.
   * @param level - The level of the unit.
   * @returns The name of the unit.
   */
const getUnitName = (type: UnitType, level: number): string => {
  const unit = UnitTypes.find((u) => u.type === type && u.level === level);
  return unit ? unit.name : 'Unknown';
};

/**
   * Formats a timestamp into a human-readable date and time string.
   * @param timestamp - The timestamp to format.
   * @returns The formatted date and time string.
   */
const formatDate = (timestamp: string | number | Date) => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
   * Generates a random string of a given length.
   * @param length - The length of the random string.
   * @returns The random string.
   */
const generateRandomString = (length: number) => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
   * Calculates the level of a user based on their XP using the levelXPArray.
   * @param xp - The amount of XP the user has.
   * @returns The user's level.
   */
const getLevelFromXP = (xp: number): number => {
  for (let i = 0; i < levelXPArray.length; i++) {
    if (xp < levelXPArray[i].xp) {
      return levelXPArray[i].level - 1 == 0 ? 1 : levelXPArray[i].level - 1;
    }
  }
  return levelXPArray[levelXPArray.length - 1].level; // Return max level if XP exceeds all defined levels
}

/*
  * Returns the source for the avatar image.
  * @param avatar - The avatar string
  * @param race (optional) - the race of the user
  * @returns The source for the avatar image.
*/
const getAvatarSrc = (avatar: string, race?: string) => {
  if(avatar.startsWith('http')) {
    return avatar;
  }
  if (avatar === 'SHIELD') {
    if (race) {
      return `/assets/shields/${race}_25x25.webp`
    }
  }
}

export { formatDate, getUnitName, generateRandomString, getLevelFromXP, getAvatarSrc };
