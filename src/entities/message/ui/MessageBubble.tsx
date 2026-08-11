import { Text, View } from 'react-native';
import { cn } from '@/shared/lib/utils';

interface MessageBubbleProps {
  content: string;
  isMine: boolean;
}

// 메시지 하나를 표현하는 말풍선 — 보낸 사람이 나인지에 따라 정렬(좌/우)과 색상이 달라짐.
// 채팅 이모지 API가 생기면 CommentThread/ReactionBar와 같은 패턴으로 추가할 예정
export function MessageBubble({ content, isMine }: MessageBubbleProps) {
  return (
    <View className={cn('gap-xs', isMine ? 'items-end' : 'items-start')}>
      <View
        className={cn(
          'rounded-lg px-md py-sm',
          isMine ? 'bg-brand' : 'border border-border bg-page'
        )}
      >
        <Text className={isMine ? 'text-on-brand' : undefined}>{content}</Text>
      </View>
    </View>
  );
}
