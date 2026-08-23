import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { showNotReady } from '@/shared/lib/showNotReady';
import SearchIcon from '@/shared/assets/icons/search.svg';
import { ChatRoomListItem } from '@/entities/chatRoom';
import { dummyChatRooms } from '@/shared/config/dummy';

interface ChatRoomListProps {
  // 폰에서는 목록만 보여주므로 강조할 방이 없다(undefined).
  activeRoomId?: string;
  onSelectRoom: (roomId: string) => void;
}

// 채팅방 목록 사이드바 — 헤더(제목 + 검색) + 방 목록
export function ChatRoomList({
  activeRoomId,
  onSelectRoom,
}: ChatRoomListProps) {
  const { t } = useTranslation();

  return (
    <View className="w-full border-r border-border tablet:w-[320px]">
      <View className="h-[62px] flex-row items-center justify-between border-b border-border px-lg">
        <Text variant="title">{t('chat.title')}</Text>
        {/* 채팅방 검색 */}
        <Pressable onPress={showNotReady} hitSlop={8}>
          <SearchIcon width={22} height={22} />
        </Pressable>
      </View>
      {dummyChatRooms.map((room) => (
        <ChatRoomListItem
          key={room.id}
          name={room.name}
          lastMessage={room.lastMessage}
          lastMessageTime={room.lastMessageTime}
          isActive={room.id === activeRoomId}
          onPress={() => onSelectRoom(room.id)}
        />
      ))}
    </View>
  );
}
