import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { dummyChatRooms, type DummyChatRoom } from '@/shared/config/dummy';
import { ChatRoomListItem } from '@/entities/chatRoom';
import SearchIcon from '@/shared/assets/icons/search.svg';
import ChatPlusIcon from '@/shared/assets/icons/chatPlus.svg';
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';
import { NewChatMenu } from './NewChatMenu';

// 방 이름과 참여자 이름을 모두 검색 대상으로 삼는다.
// (그룹방은 참여자 한 명만 일치해도 노출)
function matchesKeyword(room: DummyChatRoom, keyword: string): boolean {
  const needle = keyword.trim().toLowerCase();
  if (!needle) return true;
  if (room.name.toLowerCase().includes(needle)) return true;
  return room.participants.some((name) => name.toLowerCase().includes(needle));
}

interface ChatRoomListProps {
  // 폰에서는 목록만 보여주므로 강조할 방이 없다(undefined).
  activeRoomId?: string;
  onSelectRoom: (roomId: string) => void;
  showNewChat?: boolean;
}

// 채팅방 목록 — 헤더(기본/검색 모드) + 방 목록
export function ChatRoomList({
  activeRoomId,
  onSelectRoom,
  showNewChat = false,
}: ChatRoomListProps) {
  const { t } = useTranslation();
  const [searchMode, setSearchMode] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  const closeSearch = useCallback(() => {
    setSearchMode(false);
    setKeyword('');
  }, []);

  // 검색 모드에서의 하드웨어 뒤로가기는 화면을 옮기지 않고 검색만 해제한다.
  // true를 반환해야 기본 뒤로가기 동작이 막힌다. 웹에서는 no-op.
  useEffect(() => {
    if (!searchMode) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        closeSearch();
        return true;
      }
    );
    return () => subscription.remove();
  }, [searchMode, closeSearch]);

  const rooms = useMemo(
    () =>
      searchMode
        ? dummyChatRooms.filter((room) => matchesKeyword(room, keyword))
        : dummyChatRooms,
    [searchMode, keyword]
  );

  const renderItem = useCallback(
    ({ item }: { item: DummyChatRoom }) => (
      <ChatRoomListItem
        room={item}
        isActive={item.id === activeRoomId}
        onPress={() => onSelectRoom(item.id)}
      />
    ),
    [activeRoomId, onSelectRoom]
  );

  const keyExtractor = useCallback((room: DummyChatRoom) => room.id, []);

  return (
    <View className="h-full w-full border-r border-border bg-page tablet:w-[320px]">
      {searchMode ? (
        <View className="h-[62px] flex-row items-center gap-md px-lg">
          <Pressable onPress={closeSearch} hitSlop={8}>
            <ArrowLeftIcon width={20} height={20} color={COLORS.text} />
          </Pressable>
          <View className="h-[40px] flex-1 flex-row items-center gap-sm rounded-md bg-surface px-md">
            <TextInput
              autoFocus
              value={keyword}
              onChangeText={setKeyword}
              placeholder={t('chat.searchPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              className="flex-1 text-primary"
            />
            {keyword.length > 0 && (
              <Pressable
                onPress={() => setKeyword('')}
                hitSlop={8}
                accessibilityLabel={t('chat.clearSearch')}
              >
                <Text className="text-muted">✕</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        <View className="h-[62px] flex-row items-center justify-between border-b border-border px-lg">
          <Text variant="title">{t('chat.title')}</Text>
          <View className="flex-row items-center gap-lg">
            <Pressable
              onPress={() => setSearchMode(true)}
              hitSlop={8}
              accessibilityLabel={t('chat.searchPlaceholder')}
            >
              <SearchIcon width={22} height={22} color={COLORS.text} />
            </Pressable>
            {showNewChat && (
              <Pressable
                onPress={() => setMenuVisible(true)}
                hitSlop={8}
                accessibilityLabel={t('chat.newChat')}
                className="border-tertiary h-[24px] w-[24px] items-center justify-center rounded-full border-[1.5px]"
              >
                <ChatPlusIcon width={12} height={12} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {searchMode && (
        <View className="px-lg py-md">
          <Text variant="caption" className="text-muted">
            {t('chat.searchResult')}
          </Text>
        </View>
      )}

      <FlatList
        className="flex-1"
        data={rooms}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          searchMode ? (
            <View className="items-center py-3xl">
              <Text className="text-muted">{t('chat.searchEmpty')}</Text>
            </View>
          ) : null
        }
      />

      <NewChatMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </View>
  );
}
