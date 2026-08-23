import { Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';

interface ChatRoomListItemProps {
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  isActive: boolean;
  onPress: () => void;
}

// 채팅방 목록의 항목 하나 — 현재 열려있는 방(isActive)만 배경색이 강조됨.
// 폰에서는 누르면 대화창 화면으로 이동하고, 태블릿·데스크탑에서는 우측
// 분할 패널의 대상이 바뀐다.
export function ChatRoomListItem({
  name,
  lastMessage,
  lastMessageTime,
  isActive,
  onPress,
}: ChatRoomListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'h-[70px] flex-row items-center gap-md border-b border-border px-lg active:bg-subtle',
        isActive ? 'bg-brand-subtle' : 'bg-page'
      )}
    >
      <View className="h-[44px] w-[44px] rounded-full bg-subtle" />
      <View className="flex-1">
        <Text className="font-bold">{name}</Text>
        <Text className="text-muted" numberOfLines={1}>
          {lastMessage}
        </Text>
      </View>
      <Text className="text-muted">{lastMessageTime}</Text>
    </Pressable>
  );
}
