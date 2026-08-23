import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  SectionList,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { Sheet } from '@/shared/ui/sheet';
import { cn } from '@/shared/lib/utils';
import { toast } from '@/shared/lib/toast';
import { COLORS } from '@/shared/lib/theme';
import {
  useBreakpoints,
  MIN_SUPPORTED_WIDTH,
} from '@/shared/lib/useBreakpoints';
// @/entities/post 배럴을 거치면 PostCard가 딸려오고, PostCard가 다시
// @/features/post-share를 import해서 순환 참조가 생긴다. 파일을 직접 가리킨다.
import { useFeedQuery } from '@/entities/post/model/useFeedQuery';
import { resolveMediaUrl } from '@/entities/post/lib/resolveMediaUrl';
import type { PostSummary } from '@/entities/post/api/postsApi';
import { PostVideoThumbnail } from '@/entities/post/ui/PostVideoThumbnail';
import {
  extractPreviewText,
  getTimeslotLabel,
} from '@/entities/post/model/postContent';
import DayIcon from '@/shared/assets/icons/day.svg';
import NightIcon from '@/shared/assets/icons/night.svg';

interface RecordPickerSheetProps {
  visible: boolean;
  onClose: () => void;
}

const DESKTOP_MODAL_WIDTH = 440;
const DESKTOP_MODAL_MAX_HEIGHT = 640;
// 한 번에 보낼 수 있는 기록 수
const MAX_SELECTION = 5;
const COLUMNS = 2;
const LIMIT_NOTICE_DURATION_MS = 2000;

// SectionList는 다중 열을 직접 지원하지 않는다. 섹션의 data를 "행(최대 2개)"
// 단위로 미리 묶어두고 renderItem이 한 행을 그리는 방식으로 2열을 만든다.
// 이렇게 하면 stickySectionHeadersEnabled를 그대로 쓸 수 있다.
interface RecordSection {
  title: string;
  data: PostSummary[][];
}

function chunk(items: PostSummary[], size: number): PostSummary[][] {
  const rows: PostSummary[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

// 채팅방에 보낼 내 기록을 고르는 화면.
// 백엔드 공유 API는 STOMP 전용(@MessageMapping "/chat.sharePost")이고
// 채팅방 목록 API도 없어서, 이번 단계에서는 선택 상태만 관리하고 전송은
// 토스트로 흉내 낸다. 실연동은 채팅방 목록 API가 나온 뒤 별도 이슈에서.
export function RecordPickerSheet({
  visible,
  onClose,
}: RecordPickerSheetProps) {
  const { t } = useTranslation();
  const { device } = useBreakpoints();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 선택 상한 안내는 전역 토스트 대신 시트 안에서 띄운다. 전역 토스트는 화면
  // 최상단에 뜨는데, 이 시트는 모달/바텀시트라 안내가 컨텍스트 밖에 표시된다.
  const [limitNotice, setLimitNotice] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showLimitNotice = () => {
    setLimitNotice(true);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(
      () => setLimitNotice(false),
      LIMIT_NOTICE_DURATION_MS
    );
  };

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    []
  );

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useFeedQuery();

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  // recordedDate(yyyy-MM-dd) 기준으로 묶는다. 백엔드가 이미 최신순으로
  // 내려주므로 별도 정렬 없이 등장 순서를 그대로 쓴다.
  const sections = useMemo<RecordSection[]>(() => {
    const byDate = new Map<string, PostSummary[]>();
    for (const post of posts) {
      const list = byDate.get(post.recordedDate) ?? [];
      list.push(post);
      byDate.set(post.recordedDate, list);
    }
    return [...byDate.entries()].map(([date, items]) => {
      const [, month, day] = date.split('-');
      return {
        title: t('recordPicker.dateHeading', {
          month: Number(month),
          day: Number(day),
        }),
        data: chunk(items, COLUMNS),
      };
    });
  }, [posts, t]);

  const selectedCount = selectedIds.size;
  const canSend = selectedCount > 0;

  // setState 업데이터 안에서 부수효과를 내지 않도록 판정을 바깥으로 뺐다.
  const toggleRecord = (postId: string) => {
    if (selectedIds.has(postId)) {
      const next = new Set(selectedIds);
      next.delete(postId);
      setSelectedIds(next);
      return;
    }
    if (selectedIds.size >= MAX_SELECTION) {
      showLimitNotice();
      return;
    }
    setSelectedIds(new Set(selectedIds).add(postId));
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setLimitNotice(false);
    onClose();
  };

  const handleSend = () => {
    if (!canSend) return;
    toast.success(t('recordPicker.shared', { count: selectedCount }));
    setSelectedIds(new Set());
    onClose();
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const renderCard = (post: PostSummary) => {
    const selected = selectedIds.has(post.postId);
    const cover = post.attachments[0];
    const coverUrl = cover ? resolveMediaUrl(cover) : undefined;
    const isVideo = cover?.contentType.startsWith('video/') ?? false;
    const slotLabel = getTimeslotLabel(post.timeslot);
    const caption = extractPreviewText(post.content);
    const SlotIcon = post.timeslot === 'PM' ? NightIcon : DayIcon;

    return (
      <Pressable
        key={post.postId}
        onPress={() => toggleRecord(post.postId)}
        className={cn(
          'flex-1 overflow-hidden rounded-md border bg-page',
          selected ? 'border-brand' : 'border-border'
        )}
      >
        <View className="aspect-[4/3] w-full items-center justify-center bg-subtle">
          {coverUrl &&
            (isVideo ? (
              // 그리드에서는 진짜 플레이어를 띄우지 않는다 — 여러 개를 동시에
              // 마운트하면 expo-video가 released 된 객체를 참조하며 크래시한다.
              <PostVideoThumbnail
                uri={coverUrl}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <Image
                source={{ uri: coverUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ))}

          {isVideo && (
            <View className="absolute h-[28px] w-[28px] items-center justify-center rounded-full bg-black/50">
              <Text className="text-white">▶</Text>
            </View>
          )}

          {slotLabel && (
            <View className="absolute left-sm top-sm flex-row items-center gap-xs rounded-full bg-black/35 px-sm py-xs">
              <SlotIcon width={12} height={12} color="#FFFFFF" />
              <Text variant="caption" className="text-white">
                {t('recordPicker.slotBadge', { slot: slotLabel })}
              </Text>
            </View>
          )}

          <View
            className={cn(
              'absolute right-sm top-sm h-[22px] w-[22px] items-center justify-center rounded-full border',
              selected ? 'border-brand bg-brand' : 'border-white bg-black/20'
            )}
          >
            {selected && <Text className="text-on-brand">✓</Text>}
          </View>
        </View>

        <View className="px-sm py-xs">
          <Text variant="caption" className="text-secondary" numberOfLines={1}>
            {caption || t('post.emptyContent')}
          </Text>
        </View>
      </Pressable>
    );
  };

  // 좌우 여백은 컨테이너(Sheet의 인라인 padding / Modal의 p-lg)가 갖는다.
  // 최소 폭 아래로는 카드가 찌그러지지 않도록 minWidth로 막는다.
  const content = (
    <View
      className="flex-1 gap-md"
      style={{ minWidth: MIN_SUPPORTED_WIDTH - 32 }}
    >
      <View className="flex-row items-center justify-between">
        <Text variant="heading">{t('recordPicker.title')}</Text>
        <View className="flex-row items-center gap-md">
          {/* 0개일 때도 노출해 상한을 미리 알린다 */}
          <Text variant="body-strong" className="text-neutral-300">
            {t('recordPicker.counter', {
              selected: selectedCount,
              max: MAX_SELECTION,
            })}
          </Text>
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            className={cn(
              'h-[36px] items-center justify-center rounded-full px-lg',
              canSend ? 'bg-brand active:bg-brand-press' : 'bg-subtle'
            )}
          >
            <Text
              className={cn(
                'font-sans-bold',
                canSend ? 'text-on-brand' : 'text-tertiary'
              )}
            >
              {t('recordPicker.send')}
            </Text>
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View className="items-center py-3xl">
          <ActivityIndicator color={COLORS.brand} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(row) => row.map((post) => post.postId).join('-')}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          renderSectionHeader={({ section }) => (
            <View className="bg-page py-sm">
              <Text variant="body-strong" className="text-primary">
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item: row }) => (
            <View className="mb-md flex-row gap-md">
              {row.map(renderCard)}
              {/* 마지막 행이 1개면 빈 칸을 채워 좌측 정렬을 유지한다 */}
              {row.length < COLUMNS && <View className="flex-1" />}
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center py-3xl">
              <Text className="text-muted">{t('recordPicker.empty')}</Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="items-center py-lg">
                <ActivityIndicator color={COLORS.brand} />
              </View>
            ) : null
          }
        />
      )}

      {limitNotice && (
        <View
          pointerEvents="none"
          className="absolute inset-x-0 bottom-3xl items-center px-lg"
        >
          <View className="flex-row items-center gap-sm rounded-full bg-black/75 px-lg py-md">
            <View className="h-[16px] w-[16px] items-center justify-center rounded-full border border-white">
              <Text className="text-[10px] leading-[12px] text-white">i</Text>
            </View>
            <Text variant="body-small" className="text-white">
              {t('recordPicker.maxReached', { max: MAX_SELECTION })}
            </Text>
          </View>
        </View>
      )}
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
              minWidth: MIN_SUPPORTED_WIDTH,
              maxWidth: DESKTOP_MODAL_WIDTH,
              height: '90%',
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
    <Sheet visible={visible} onClose={handleClose} className="h-[80%]">
      {content}
    </Sheet>
  );
}
