import { View } from 'react-native';
import { Text } from '@/shared/ui/text';

interface ChatRoomListItemProps {
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  isActive: boolean;
}

// 채팅방 목록의 항목 하나 — 현재 열려있는 방(isActive)만 배경색이 강조됨
export function ChatRoomListItem({
  name,
  lastMessage,
  lastMessageTime,
  isActive,
}: ChatRoomListItemProps) {
  return (
    <View
      className={`h-[70px] flex-row items-center gap-md border-b border-border px-lg ${isActive ? 'bg-brand-subtle' : 'bg-page'}`}
    >
      <View className="h-[44px] w-[44px] rounded-full bg-subtle" />
      <View className="flex-1">
        <Text className="font-bold">{name}</Text>
        <Text className="text-muted">{lastMessage}</Text>
      </View>
      <Text className="text-muted">{lastMessageTime}</Text>
    </View>
  );
}
