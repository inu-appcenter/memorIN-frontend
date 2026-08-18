import { useMemo, useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { Sheet } from '@/shared/ui/sheet';
import { cn } from '@/shared/lib/utils';
import { toast } from '@/shared/lib/toast';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { dummyChatRooms } from '@/shared/config/dummy';
import type { PostSummary } from '@/entities/post/api/postsApi';

interface PostShareSheetProps {
  post: PostSummary;
  visible: boolean;
  onClose: () => void;
}

const DESKTOP_MODAL_WIDTH = 420;
const DESKTOP_MODAL_MAX_HEIGHT = 560;

// 채팅방 다중 선택 후 게시물을 공유
// 백엔드에 채팅방 목록/메시지 전송 API가 아직 없어서 실제 전송은 하지 않고 선택 상태만 로컬에서 관리
// 실 연동은 API가 나온 뒤 별도 이슈에서 진행한다.
// 폰/태블릿은 하단 시트, 데스크탑은 중앙 모달로 분기한다.
export function PostShareSheet({
  post,
  visible,
  onClose,
}: PostShareSheetProps) {
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
    toast.success(
      `${count}개 채팅방에 공유했어요.(실제 공유는 아님. api 연동필요)`
    );
    setSelectedIds(new Set());
    setKeyword('');
    onClose();
  };

  const content = (
    <View className="gap-lg px-md">
      <Text variant="heading">공유하기</Text>

      <View className="h-[44px] flex-row items-center rounded-md bg-surface px-lg">
        <TextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder="채팅방 검색"
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          className="flex-1 text-primary"
        />
      </View>

      <View className="gap-xs">
        {filteredRooms.map((room) => {
          const selected = selectedIds.has(room.id);
          return (
            <Pressable
              key={room.id}
              onPress={() => toggleRoom(room.id)}
              className={cn(
                'flex-row items-center gap-md rounded-md py-sm',
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
              &lsquo;{keyword}&rsquo;에 대한 검색 결과가 없어요
            </Text>
          </View>
        )}
      </View>

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
            ? '채팅방을 선택하세요'
            : `${selectedIds.size}개 방에 보내기`}
        </Text>
      </Pressable>
    </View>
  );

  if (device === 'desktop') {
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
              maxWidth: DESKTOP_MODAL_WIDTH,
              maxHeight: DESKTOP_MODAL_MAX_HEIGHT,
            }}
          >
            {content}
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
