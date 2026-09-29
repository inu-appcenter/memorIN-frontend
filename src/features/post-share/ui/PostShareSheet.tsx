import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { Sheet } from '@/shared/ui/sheet';
import { cn } from '@/shared/lib/utils';
import { toast } from '@/shared/lib/toast';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { dummyChatRooms } from '@/shared/config/dummy';
import CrossIcon from '@/shared/assets/icons/cross.svg';
import type { PostActionTarget } from '@/entities/post/api/postsApi';

interface PostShareSheetProps {
  // 현재 화면에서는 쓰이지 않지만 시그니처를 유지한다. STOMP 연동 시
  // /app/chat.sharePost 페이로드의 postId로 그대로 들어갈 값이라, 지금 빼면
  // 호출부(PostCard, PostActionsMenu)를 전부 다시 고쳐야 한다.
  post: PostActionTarget;
  visible: boolean;
  onClose: () => void;
}

const MODAL_WIDTH = 420;
const MODAL_MAX_HEIGHT = 560;
// 모달의 최소 높이 설정
const ROOM_LIST_MIN_HEIGHT = 252;
const CLOSE_RIGHT_INSET_PX = 28;
const HEADING_LINE_HEIGHT_PX = 26;
const HEADING_LINE_HEIGHT_DESKTOP_PX = 29;

// 채팅방 다중 선택 후 게시물을 공유.
// 백엔드 공유 API는 STOMP 전용(@MessageMapping "/chat.sharePost")이고 채팅방
// 목록 API도 없어서, 실제 전송은 하지 않고 선택 상태만 로컬에서 관리한다.
// 실 연동은 채팅방 목록 API가 나온 뒤 별도 이슈에서 진행한다.
// 폰은 하단 시트, 태블릿·데스크탑은 모달로 띄운다.
export function PostShareSheet({ visible, onClose }: PostShareSheetProps) {
  const { t } = useTranslation();
  const { device } = useBreakpoints();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [keyword, setKeyword] = useState('');

  const filteredRooms = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return dummyChatRooms;
    return dummyChatRooms.filter((room) =>
      room.name.toLowerCase().includes(trimmed)
    );
  }, [keyword]);

  const toggleRoom = (roomId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      return next;
    });
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setKeyword('');
    onClose();
  };

  const handleSend = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    toast.success(t('share.shared', { count }));
    setSelectedIds(new Set());
    setKeyword('');
    onClose();
  };

  const content = (
    <View className="flex-1 gap-lg px-md">
      <Text variant="heading">{t('share.title')}</Text>

      <View className="h-[44px] flex-row items-center rounded-md bg-surface px-lg">
        <TextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder={t('share.searchPlaceholder')}
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          className="flex-1 text-primary"
        />
      </View>

      <ScrollView
        style={{ flex: 1, minHeight: ROOM_LIST_MIN_HEIGHT }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-xs">
          {filteredRooms.map((room) => {
            const selected = selectedIds.has(room.id);
            return (
              <Pressable
                key={room.id}
                onPress={() => toggleRoom(room.id)}
                className={cn(
                  'flex-row items-center gap-md rounded-md px-sm py-sm',
                  selected && 'bg-brand-subtle'
                )}
              >
                <View className="h-[44px] w-[44px] rounded-full bg-subtle" />
                <View className="flex-1">
                  <Text className="font-bold">{room.name}</Text>
                  <Text className="text-muted" numberOfLines={1}>
                    {room.lastMessage}
                  </Text>
                </View>
                <View
                  className={cn(
                    'h-[22px] w-[22px] items-center justify-center rounded-full border',
                    selected ? 'border-brand bg-brand' : 'border-border bg-page'
                  )}
                >
                  {selected && <Text className="text-on-brand">✓</Text>}
                </View>
              </Pressable>
            );
          })}
          {filteredRooms.length === 0 && (
            <View className="items-center py-xl">
              <Text className="text-muted">
                {t('share.emptyResult', { keyword })}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={handleSend}
        disabled={selectedIds.size === 0}
        className={cn(
          'h-[52px] items-center justify-center rounded-md',
          selectedIds.size === 0
            ? 'bg-subtle'
            : 'bg-brand active:bg-brand-press'
        )}
      >
        <Text
          className={cn(
            'font-sans-bold',
            selectedIds.size === 0 ? 'text-tertiary' : 'text-on-brand'
          )}
        >
          {selectedIds.size === 0
            ? t('share.selectPrompt')
            : t('share.sendToRooms', { count: selectedIds.size })}
        </Text>
      </Pressable>
    </View>
  );

  if (device !== 'phone') {
    if (!visible) return null;
    return (
      <Modal
        visible
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View className="flex-1 items-center justify-center p-xl">
          {/* 배경 클릭으로도 닫힌다 */}
          <Pressable
            onPress={handleClose}
            className="bg-black/60"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <View
            className="w-full overflow-hidden rounded-lg border border-border bg-page p-lg"
            style={{
              maxWidth: MODAL_WIDTH,
              maxHeight: MODAL_MAX_HEIGHT,
            }}
          >
            {content}
            {/* 폰 시트는 배경 탭과 드래그 핸들로 닫지만, 모달에서는 명시적인 닫기 버튼을 둔다. 
                content보다 뒤에 두는 건 RN Web에서 형제 View가 각각 독립된 스택 컨텍스트라 z-index로는
                위로 못 올라오기 때문이다. */}
            <Pressable
              onPress={handleClose}
              hitSlop={8}
              className="absolute top-lg items-center justify-center"
              style={{
                right: CLOSE_RIGHT_INSET_PX,
                height:
                  device === 'desktop'
                    ? HEADING_LINE_HEIGHT_DESKTOP_PX
                    : HEADING_LINE_HEIGHT_PX,
              }}
            >
              <CrossIcon width={15} height={15} color={COLORS.textSecondary} />
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Sheet visible={visible} onClose={handleClose} className="h-[70%]">
      {content}
    </Sheet>
  );
}
