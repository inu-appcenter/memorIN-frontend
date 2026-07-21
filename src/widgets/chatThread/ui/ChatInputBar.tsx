import { View } from 'react-native';
import { Text } from '@/shared/ui/text';

// 대화창 하단 메시지 입력창
export function ChatInputBar() {
  return (
    <View className="h-[76px] flex-row items-center gap-md border-t border-border bg-page px-xl">
      <View className="h-[44px] flex-1 justify-center rounded-full bg-surface px-lg">
        <Text className="text-muted">메시지 입력...</Text>
      </View>
      <Text className="text-[28px] text-link">↗</Text>
    </View>
  );
}
