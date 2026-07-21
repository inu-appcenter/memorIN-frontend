import { View } from 'react-native';
import { Text } from '@/shared/ui/text';

interface MessageBubbleProps {
  content: string;
  isMine: boolean;
}

// 메시지 하나를 표현하는 말풍선 — 보낸 사람이 나인지에 따라 정렬(좌/우)과 색상이 달라짐
export function MessageBubble({ content, isMine }: MessageBubbleProps) {
  if (isMine) {
    return (
      <View className="self-end rounded-lg bg-brand px-md py-sm">
        <Text className="text-on-brand">{content}</Text>
      </View>
    );
  }
  return (
    <View className="self-start rounded-lg border border-border bg-page px-md py-sm">
      <Text>{content}</Text>
    </View>
  );
}
