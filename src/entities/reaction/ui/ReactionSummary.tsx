import { Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { REACTION_ICONS } from '../model/reactionIcons';
import type { ReactionTargetType, ReactionType } from '../model/types';
import { useTargetReactions } from '../model/useReactionsStore';

interface ReactionSummaryProps {
  targetType: ReactionTargetType;
  targetId: string;
}

// 반응을 이모지+카운트 pill로 집계해서 보여준다
export function ReactionSummary({
  targetType,
  targetId,
}: ReactionSummaryProps) {
  const { counts, myReaction, toggle } = useTargetReactions(
    targetType,
    targetId
  );
  const entries = (Object.entries(counts) as [ReactionType, number][]).filter(
    ([, count]) => count > 0
  );

  if (entries.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-xs">
      {entries.map(([type, count]) => {
        const Icon = REACTION_ICONS[type];
        const isMine = myReaction === type;
        return (
          <Pressable
            key={type}
            onPress={() => toggle(type)}
            className={
              isMine
                ? 'flex-row items-center gap-xs rounded-full border border-brand bg-brand-subtle px-sm py-xs'
                : 'flex-row items-center gap-xs rounded-full border border-border bg-subtle px-sm py-xs'
            }
          >
            <Icon width={14} height={14} />
            <Text variant="caption">{count}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
