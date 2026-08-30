import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import type { DummyChatRoom } from '@/shared/config/dummy';
import { ChatRoomAvatar } from './ChatRoomAvatar';

const UNREAD_BADGE_SIZE = 20;

interface ChatRoomListItemProps {
  room: DummyChatRoom;
  isActive: boolean;
  onPress: () => void;
}

// 채팅방 목록의 항목 하나. 현재 열려있는 방(isActive)만 배경색이 강조된다.
export function ChatRoomListItem({
  room,
  isActive,
  onPress,
}: ChatRoomListItemProps) {
  const { t } = useTranslation();
  const hasUnread = room.unreadCount > 0;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'h-[78px] flex-row items-center gap-md border-b border-border px-lg active:bg-subtle',
        isActive ? 'bg-brand-subtle' : 'bg-page'
      )}
    >
      <ChatRoomAvatar isGroup={room.isGroup} />

      <View className="flex-1 gap-xs">
        <View className="flex-row items-center gap-xs">
          <Text className="font-bold" numberOfLines={1}>
            {room.name}
          </Text>
          {room.isGroup && (
            <Text variant="caption" className="text-muted">
              {room.memberCount}
            </Text>
          )}
        </View>
        <Text className="text-muted" numberOfLines={1}>
          {room.lastMessage}
        </Text>
      </View>

      {/* 시간은 위, 안 읽음 배지는 아래. 배지가 없어도 시간 위치는 그대로 둔다. */}
      <View className="h-[46px] items-end justify-between">
        <Text variant="caption" className="text-muted">
          {room.lastMessageTime}
        </Text>
        {hasUnread ? (
          <View
            accessibilityLabel={t('chat.unreadCount', {
              count: room.unreadCount,
            })}
            style={{
              minWidth: UNREAD_BADGE_SIZE,
              height: UNREAD_BADGE_SIZE,
              borderRadius: UNREAD_BADGE_SIZE / 2,
              paddingHorizontal: 6,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: COLORS.accent,
            }}
          >
            <Text variant="caption" className="font-bold text-on-brand">
              {room.unreadCount}
            </Text>
          </View>
        ) : (
          <View style={{ height: UNREAD_BADGE_SIZE }} />
        )}
      </View>
    </Pressable>
  );
}
