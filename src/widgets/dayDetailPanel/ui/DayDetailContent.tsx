import { Image, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { formatDateHeading } from '@/shared/lib/calendarDate';
import {
  extractPreviewText,
  getPostCreatedAt,
} from '@/entities/post/model/postContent';
import { resolveMediaUrl } from '@/entities/post/lib/resolveMediaUrl';
import { PostVideoCover } from '@/entities/post/ui/PostVideoCover';
import { PostVideoThumbnail } from '@/entities/post/ui/PostVideoThumbnail';
import { useCommentThread } from '@/entities/post/model/useComments';
import { usePostLikes } from '@/entities/post/model/usePostLikes';
import { useMyProfile } from '@/entities/session/model/useMyProfile';
import { PostActionsMenu } from '@/features/post-edit';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import HeartIcon from '@/shared/assets/icons/heart.svg';
import HeartFilled2Icon from '@/shared/assets/icons/heartFilled2.svg';
import FeedChatIcon from '@/shared/assets/icons/feedChat.svg';
import { useDaySlots, getSlotLabel } from '../model/useDaySlots';
import type { PostSummary, TimeslotType } from '@/entities/post/api/postsApi';

interface DayDetailContentProps {
  date: Date;
  onOpenStory: (posts: PostSummary[], startIndex: number) => void;
  onOpenPost?: (postId: string) => void; // 폰 시안의 '기록 보기 ›'
  showComments?: boolean; // 데스크탑 패널에서만 슬롯별 댓글 미리보기 + 선택 강조 표시
  activeSlot?: TimeslotType | null;
  onSelectSlot?: (slot: TimeslotType) => void;
}
const CARD_MEDIA_ASPECT_RATIO = 16 / 9;
const CARD_VIDEO_BADGE_SIZE = 36;

function formatClock(date: Date | null): string {
  if (!date) return '';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 게시물 하나의 좋아요/댓글 미리보기(개수 + 최근 2개). 입력은 DayDetailPanel 하단 공용 ReplyBar가 담당한다.
function SlotCommentsPreview({ postId }: { postId: string }) {
  const { t } = useTranslation();
  const { data: comments, isLoading } = useCommentThread(postId);
  const { liked, count: likeCount, toggle: toggleLike } = usePostLikes(postId); // PostCard와 같은 스토어라 피드 쪽 좋아요 상태와 자동으로 연동됨
  // 최근 댓글이 잘 보이도록 뒤에서 2개 — 백엔드가 오래된 순으로 내려주므로 새 댓글은 배열 끝에 붙는다
  const recentComments = comments?.slice(-2);

  return (
    <View style={{ marginTop: 8, gap: 8 }}>
      <View className="flex-row items-center gap-md">
        <Pressable
          onPress={toggleLike}
          hitSlop={8}
          className="flex-row items-center gap-xs"
        >
          <Text
            variant="body-small"
            style={{ color: liked ? COLORS.error : COLORS.tertiary }}
          >
            {liked ? '♥' : '♡'}
          </Text>
          <Text variant="body-small" className="text-tertiary">
            {likeCount}
          </Text>
        </Pressable>
        <Text variant="body-small" className="text-secondary">
          {t('comment.count', { count: comments?.length ?? 0 })}
        </Text>
      </View>
      {!isLoading &&
        recentComments?.map((comment) => (
          <View key={comment.commentId} className="flex-row gap-sm">
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: COLORS.bgSubtle,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            />
            <View className="flex-1">
              <Text variant="body-small" className="text-secondary">
                {comment.deleted ? t('comment.deleted') : comment.body}
              </Text>
            </View>
          </View>
        ))}
    </View>
  );
}

// 폰 시안의 기록 카드. 썸네일이 카드 상단을 꽉 채우고, 그 아래로 제목·작성자·
// 본문·반응이 붙는다. 실제 기록은 '기록 보기 ›'로 상세 화면에서 연다.
function DayRecordCard({
  slot,
  post,
  authorLabel,
  onOpenPost,
}: {
  slot: TimeslotType;
  post: PostSummary | undefined;
  authorLabel: string;
  onOpenPost?: (postId: string) => void;
}) {
  const { t } = useTranslation();
  const {
    liked,
    count: likeCount,
    toggle: toggleLike,
  } = usePostLikes(post?.postId ?? '');
  const { data: comments } = useCommentThread(post?.postId);

  const title = t('calendarPage.slotRecord', { slot: getSlotLabel(slot) });

  if (!post) {
    return (
      <View className="gap-sm rounded-lg border border-border bg-page p-lg">
        <Text className="font-bold text-primary">{title}</Text>
        <Text variant="body-small" className="text-muted">
          {t('calendarPage.emptyRecord')}
        </Text>
      </View>
    );
  }

  const attachment = post.attachments[0];
  const mediaUrl = attachment ? resolveMediaUrl(attachment) : undefined;
  const isVideo = attachment?.contentType.startsWith('video/') ?? false;
  // recordedDate는 날짜까지만 있어 시각이 없다. postId(UUIDv7)의 상위 48비트가
  // 생성 시각이라 거기서 뽑는다.
  const clock = formatClock(getPostCreatedAt(post.postId));

  return (
    <View className="overflow-hidden rounded-lg border border-border bg-page">
      {mediaUrl && (
        <View
          className="w-full items-center justify-center bg-surface"
          style={{ aspectRatio: CARD_MEDIA_ASPECT_RATIO }}
        >
          {isVideo ? (
            <>
              <PostVideoThumbnail
                uri={mediaUrl}
                style={{ width: '100%', height: '100%' }}
              />
              <View
                className="absolute items-center justify-center rounded-full bg-black/50"
                style={{
                  width: CARD_VIDEO_BADGE_SIZE,
                  height: CARD_VIDEO_BADGE_SIZE,
                }}
              >
                <Text className="text-white">▶</Text>
              </View>
            </>
          ) : (
            <Image
              source={{ uri: mediaUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          )}

          {/* 미디어 위에 얹으므로 밝은 배경에서도 보이도록 dark 변형을 쓴다 */}
          <View className="absolute right-sm top-sm">
            <PostActionsMenu post={post} isOwnPost variant="dark" />
          </View>
        </View>
      )}

      <View className="gap-sm p-lg">
        <View className="flex-row items-center justify-between">
          <Text className="font-bold text-primary">{title}</Text>
          {/* 미디어가 없으면 얹을 자리가 없어 제목 줄에 둔다 */}
          {!mediaUrl && <PostActionsMenu post={post} isOwnPost />}
        </View>

        <Text variant="label" className="text-muted">
          {clock ? `${authorLabel} · ${clock}` : authorLabel}
        </Text>

        <Text className="text-secondary" numberOfLines={2}>
          {extractPreviewText(post.content) || t('post.emptyContent')}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-lg">
            <Pressable
              onPress={toggleLike}
              hitSlop={8}
              className="flex-row items-center gap-xs"
            >
              {liked ? (
                <HeartFilled2Icon width={16} height={16} color={COLORS.error} />
              ) : (
                <HeartIcon width={16} height={16} color={COLORS.tertiary} />
              )}
              <Text variant="body-small" className="text-tertiary">
                {likeCount}
              </Text>
            </Pressable>
            <View className="flex-row items-center gap-xs">
              <FeedChatIcon width={16} height={16} color={COLORS.tertiary} />
              <Text variant="body-small" className="text-tertiary">
                {t('comment.count', { count: comments?.length ?? 0 })}
              </Text>
            </View>
          </View>

          <Pressable onPress={() => onOpenPost?.(post.postId)} hitSlop={8}>
            <Text variant="label" className="text-link">
              {t('calendarPage.viewRecord')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function PhoneDayDetail({
  date,
  onOpenPost,
}: {
  date: Date;
  onOpenPost?: (postId: string) => void;
}) {
  const { t } = useTranslation();
  const { postBySlot, orderedPosts, isLoading } = useDaySlots(date);
  const { data: profile } = useMyProfile();
  const authorLabel = profile?.displayName ?? profile?.username ?? '';

  return (
    <View className="gap-lg">
      <View>
        <Text variant="heading">{formatDateHeading(date)}</Text>
        <Text variant="body-small" className="text-muted">
          {t('calendarPage.daySummary', { count: orderedPosts.length })}
        </Text>
      </View>

      {isLoading ? (
        <Text variant="body-small" className="text-muted">
          {t('comment.loading')}
        </Text>
      ) : (
        postBySlot.map(({ slot, post }) => (
          <DayRecordCard
            key={slot}
            slot={slot}
            post={post}
            authorLabel={authorLabel}
            onOpenPost={onOpenPost}
          />
        ))
      )}
    </View>
  );
}

// 테블릿·데스크탑 — 해당 시안이 나오기 전까지 기존 모습을 유지한다.
function WideDayDetail({
  date,
  onOpenStory,
  showComments = false,
  activeSlot = null,
  onSelectSlot,
}: DayDetailContentProps) {
  const { t } = useTranslation();
  const { postBySlot, orderedPosts, isLoading } = useDaySlots(date);

  return (
    <View>
      <View className="mb-lg">
        <Text variant="heading">{formatDateHeading(date)}</Text>
        <Text variant="body-small" className="text-muted">
          {t('calendarPage.daySummary', { count: orderedPosts.length })}
        </Text>
      </View>

      {isLoading && (
        <Text variant="body-small" className="text-muted">
          {t('comment.loading')}
        </Text>
      )}

      {!isLoading &&
        postBySlot.map(({ slot, post }) => {
          const attachment = post?.attachments[0];
          const isVideo =
            attachment?.contentType?.startsWith('video/') ?? false;
          const mediaUrl = attachment ? resolveMediaUrl(attachment) : undefined;
          const isActive = showComments && slot === activeSlot;

          return (
            <Pressable
              key={slot}
              onPress={() => post && onSelectSlot?.(slot)}
              disabled={!post || !onSelectSlot}
              className={cn(
                'mb-lg rounded-md p-md',
                isActive && 'bg-brand-subtle'
              )}
            >
              <View
                className="mb-sm h-[110px] w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-surface"
                style={{ position: 'relative' }}
              >
                {mediaUrl && isVideo ? (
                  <>
                    <PostVideoCover
                      uri={mediaUrl}
                      isVisible={false}
                      nativeControls={false}
                      style={{ height: '100%', width: '100%' }}
                    />
                    <View className="absolute h-[28px] w-[28px] items-center justify-center rounded-full bg-black/50">
                      <Text className="text-white">▶</Text>
                    </View>
                  </>
                ) : mediaUrl ? (
                  <Image
                    source={{ uri: mediaUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text variant="caption" className="text-tertiary">
                    {post ? 'IMG' : t('calendarPage.noRecord')}
                  </Text>
                )}

                {/* 수정/삭제 메뉴  */}
                {post && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PostActionsMenu post={post} isOwnPost variant="dark" />
                  </View>
                )}
              </View>
              <View className="w-full flex-row items-center justify-between">
                <Text variant="label">
                  {t('calendarPage.slotRecord', { slot: getSlotLabel(slot) })}
                </Text>
                {post && (
                  <Pressable
                    onPress={() =>
                      onOpenStory(orderedPosts, orderedPosts.indexOf(post))
                    }
                  >
                    <Text variant="body-small" className="text-link">
                      {t('calendarPage.viewAsStory')}
                    </Text>
                  </Pressable>
                )}
              </View>
              <Text variant="body-small" className="text-secondary">
                {post
                  ? extractPreviewText(post.content)
                  : t('calendarPage.emptyRecord')}
              </Text>

              {showComments && post && (
                <SlotCommentsPreview postId={post.postId} />
              )}
            </Pressable>
          );
        })}
    </View>
  );
}

export function DayDetailContent(props: DayDetailContentProps) {
  const { device } = useBreakpoints();
  return device === 'phone' ? (
    <PhoneDayDetail date={props.date} onOpenPost={props.onOpenPost} />
  ) : (
    <WideDayDetail {...props} />
  );
}
