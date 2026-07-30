import { Image, Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { formatKoreanDateHeading } from '@/shared/lib/calendarDate';
import { extractPreviewText } from '@/entities/post/model/postContent';
import { resolveMediaUrl } from '@/entities/post/lib/resolveMediaUrl';
import { PostVideoCover } from '@/entities/post/ui/PostVideoCover';
import { useCommentThread } from '@/entities/post/model/useComments';
import { PostActionsMenu } from '@/features/post-edit';
import { cn } from '@/shared/lib/utils';
import { useDaySlots, SLOT_LABEL } from '../model/useDaySlots';
import type { PostSummary, TimeslotType } from '@/entities/post/api/postsApi';

interface DayDetailContentProps {
  date: Date;
  onOpenStory: (posts: PostSummary[], startIndex: number) => void;
  showComments?: boolean; // 데스크탑 패널에서만 슬롯별 댓글 미리보기 + 선택 강조 표시
  activeSlot?: TimeslotType | null;
  onSelectSlot?: (slot: TimeslotType) => void;
}

// 게시물 하나의 좋아요(장식용)/댓글 미리보기(개수 + 최근 2개). 입력은 DayDetailPanel 하단 공용 ReplyBar가 담당한다.
function SlotCommentsPreview({ postId }: { postId: string }) {
  const { data: comments, isLoading } = useCommentThread(postId);
  // 최근 댓글이 잘 보이도록 뒤에서 2개 — 백엔드가 오래된 순으로 내려주므로 새 댓글은 배열 끝에 붙는다
  const recentComments = comments?.slice(-2);

  return (
    <View style={{ marginTop: 8, gap: 8 }}>
      <View className="flex-row items-center gap-md">
        {/* 좋아요 API(컨트롤러)가 아직 없어서 장식용으로만 표시 — PostCard와 동일한 컨벤션 */}
        <Text variant="body-small" className="text-tertiary">
          ♡
        </Text>
        <Text variant="body-small" className="text-secondary">
          댓글 {comments?.length ?? 0}
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
                {comment.deleted ? '삭제된 댓글' : comment.body}
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
  const { postBySlot, orderedPosts, isLoading } = useDaySlots(date);

  return (
    <View>
      <View className="mb-lg">
        <Text variant="heading">{formatKoreanDateHeading(date)}</Text>
        <Text variant="body-small" className="text-muted">
          오전 · 오후 {orderedPosts.length}/2 기록 완료
        </Text>
      </View>

      {isLoading && (
        <Text variant="body-small" className="text-muted">
          불러오는 중...
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
                    {post ? 'IMG' : '기록 없음'}
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
                    <PostActionsMenu post={post} variant="dark" />
                  </View>
                )}
              </View>
              <View className="w-full flex-row items-center justify-between">
                <Text variant="label">{SLOT_LABEL[slot]} 기록</Text>
                {post && (
                  <Pressable
                    onPress={() =>
                      onOpenStory(orderedPosts, orderedPosts.indexOf(post))
                    }
                  >
                    <Text variant="body-small" className="text-link">
                      스토리로 보기 ›
                    </Text>
                  </Pressable>
                )}
              </View>
              <Text variant="body-small" className="text-secondary">
                {post ? extractPreviewText(post.content) : '아직 기록이 없어요'}
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
