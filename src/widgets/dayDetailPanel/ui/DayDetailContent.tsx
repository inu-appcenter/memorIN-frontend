import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { formatKoreanDateHeading, toDateKey } from '@/shared/lib/calendarDate';
import { extractPreviewText } from '@/entities/post/model/postContent';
import { resolveMediaUrl } from '@/entities/post/lib/resolveMediaUrl';
import { PostVideoCover } from '@/entities/post/ui/PostVideoCover';
import { ReplyBar } from '@/shared/ui/replyBar';
import { useMonthPosts } from '@/widgets/calendarGrid/model/useMonthPosts';
import {
  INITIAL_MOCK_COMMENTS,
  type StoryComment,
} from '@/shared/config/mockComments';
import type { PostSummary, TimeslotType } from '@/entities/post/api/postsApi';

interface DayDetailContentProps {
  date: Date;
  onOpenStory: (posts: PostSummary[], startIndex: number) => void;
  showEngagement?: boolean; // 데스크탑 패널에서만 좋아요/댓글 미리보기 표시
}

const SLOT_LABEL: Record<TimeslotType, string> = { AM: '오전', PM: '오후' };
const SLOTS: TimeslotType[] = ['AM', 'PM'];
const MOCK_LIKE_COUNT = 12; // 백엔드 좋아요 API 부재로 임시 고정값

export function DayDetailContent({
  date,
  onOpenStory,
  showEngagement = false,
}: DayDetailContentProps) {
  const { data: monthPosts, isLoading } = useMonthPosts(
    date.getFullYear(),
    date.getMonth()
  );
  // 하루(오전+오후 통틀어) 단위로 댓글 하나만 존재 — 게시물별이 아니라 날짜별 mock 상태
  const [comments, setComments] = useState<StoryComment[]>(
    INITIAL_MOCK_COMMENTS
  );

  const dateKey = toDateKey(date);
  const postBySlot = SLOTS.map((slot) => ({
    slot,
    post: (monthPosts ?? []).find(
      (post) => post.recordedDate === dateKey && post.timeslot === slot
    ),
  }));
  const orderedPosts = postBySlot
    .map((entry) => entry.post)
    .filter((post): post is PostSummary => Boolean(post));

  const handleAddComment = (text: string) => {
    setComments((prev) => [
      ...prev,
      { id: String(Date.now()), author: '나', timeAgo: '방금', text, likes: 0 },
    ]);
  };

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

          return (
            <View key={slot} className="pb-lg">
              <View className="mb-sm h-[110px] w-[332px] items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-surface">
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
              </View>
              <View className="flex-row items-center justify-between">
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
            </View>
          );
        })}

      {/* 하루(오전+오후) 전체에 대한 좋아요/댓글 — 게시물별이 아니라 날짜 단위로 하나 */}
      {showEngagement && orderedPosts.length > 0 && (
        <View
          style={{
            marginTop: 8,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: '#DADCE3',
            gap: 12,
          }}
        >
          <View className="flex-row items-center gap-lg">
            <Text variant="body-small" className="text-secondary">
              ♡ 좋아요 {MOCK_LIKE_COUNT}
            </Text>
            <Text variant="body-small" className="text-secondary">
              댓글 {comments.length}
            </Text>
          </View>
          {comments.map((comment) => (
            <View key={comment.id} className="flex-row gap-sm">
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#EDEEF2',
                  borderWidth: 1,
                  borderColor: '#DADCE3',
                }}
              />
              <View className="flex-1">
                <Text variant="label">{comment.author}</Text>
                <Text variant="body-small" className="text-secondary">
                  {comment.text}
                </Text>
              </View>
            </View>
          ))}
          <ReplyBar variant="light" onSubmit={handleAddComment} />
        </View>
      )}
    </View>
  );
}
