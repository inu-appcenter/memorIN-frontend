import { View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { ChatRoomListItem } from '@/entities/chatRoom';
import { dummyChatRooms } from '@/shared/config/dummy';

// 채팅방 목록 사이드바 — 헤더(제목 + 검색) + 방 목록
export function ChatRoomList() {
  return (
    <View className="w-full border-r border-border tablet:w-[320px]">
      <View className="h-[62px] flex-row items-center justify-between border-b border-border px-lg">
        <Text variant="title">채팅</Text>
        <Text className="text-[24px]">⌕</Text>
      </View>
      {dummyChatRooms.map((room, index) => (
        <ChatRoomListItem
          key={room.id}
          name={room.name}
          lastMessage={room.lastMessage}
          lastMessageTime={room.lastMessageTime}
          isActive={index === 0}
        />
      ))}
    </View>
  );
}
