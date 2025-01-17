import { Loss } from "@/types/typings";
import toLocale from "@/utils/numberFormatting";
import { Stack, Chip, Group } from "@mantine/core";

interface Stats {
  pillagedGold: number;
  xpEarned: { defender: number, attacker: number };
  turns?: number;
  attacker_losses?: Loss;
  defender_losses?: Loss;
  forthpAtStart?: number;
  forthpAtEnd?: number;
}

interface StatsListProps {
  stats: Stats;
  type: string;
  subType: string;
  collapsed: boolean;
}

const StatsList: React.FC<StatsListProps> = ({ stats, type, subType, collapsed }) => {
  if (subType !== 'attack') return null;

  const xp = type === 'defense' ? stats.xpEarned.defender : stats.xpEarned.attacker;

  return collapsed ? (
    <Group align="center" justify="center">
      <Chip>
        <i className="ra ra-gem ra-fw" /> Gold: {toLocale(stats.pillagedGold.toLocaleString())}
      </Chip>
      <Chip>XP: {xp}</Chip>
    </Group>
  ) : (
    <Stack align="center" justify="center" gap="xs">
      <Chip>
        <i className="ra ra-gem ra-fw" /> Gold: {toLocale(stats.pillagedGold.toLocaleString())}
      </Chip>
      <Chip>XP: {xp}</Chip>
      <Chip>Turns: {stats.turns}</Chip>
    </Stack>
  );
};

export default StatsList;