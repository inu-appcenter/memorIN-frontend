import { Image, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { formatDateHeading } from '@/shared/lib/calendarDate';
import { extractPreviewText } from '@/entities/post/model/postContent';
import { resolveMediaUrl } from '@/entities/post/lib/resolveMediaUrl';
import { PostVideoCover } from '@/entities/post/ui/PostVideoCover';
import { useCommentThread } from '@/entities/post/model/useComments';
import { usePostLikes } from '@/entities/post/model/usePostLikes';
import { PostActionsMenu } from '@/features/post-edit';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import { useDaySlots, getSlotLabel } from '../model/useDaySlots';
import type { PostSummary, TimeslotType } from '@/entities/post/api/postsApi';

interface DayDetailContentProps {
  date: Date;
  onOpenStory: (posts: PostSummary[], startIndex: number) => void;
  showComments?: boolean; // 데스크탑 패널에서만 슬롯별 댓글 미리보기 + 선택 강조 표시
  activeSlot?: TimeslotType | null;
  onSelectSlot?: (slot: TimeslotType) => void;
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
                backgroundColor: '#EDEEF2',
                borderWidth: 1,
                borderColor: '#DADCE3',
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

export function DayDetailContent({
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
