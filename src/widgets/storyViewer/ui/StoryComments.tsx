import { ScrollView, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import {
  useCommentThread,
  useCreateComment,
} from '@/entities/post/model/useComments';
import { COLORS } from '@/shared/lib/theme';
import { ReplyBar } from '@/shared/ui/replyBar';

interface StoryCommentsProps {
  postId: string;
  variant?: 'dark' | 'light'; // 데스크탑 패널은 dark, 테블릿/폰 바텀시트는 light
}

// 방금 / N분 / N시간 / N일 형태의 상대 시간 표시
function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금';
  if (diffMin < 60) return `${diffMin}분`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일`;
}

export function StoryComments({
  postId,
  variant = 'light',
}: StoryCommentsProps) {
  const isDark = variant === 'dark';
  const bg = isDark ? COLORS.neutral600 : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.15)' : '#DADCE3';
  const textPrimary = isDark ? '#FFFFFF' : '#131519';
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : '#8A8F9C';
  const textSecondary = isDark ? 'rgba(255,255,255,0.7)' : '#333740';
  const avatarBg = isDark ? 'rgba(255,255,255,0.15)' : '#EDEEF2';

  const { data: comments, isLoading } = useCommentThread(postId);
  const createComment = useCreateComment(postId);

  const handleSubmit = (text: string) => {
    createComment.mutate(text);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: bg }}>
      <View
        className="p-lg"
        style={{ borderBottomWidth: 1, borderBottomColor: borderColor }}
      >
        <Text variant="label" style={{ color: textPrimary }}>
          댓글 {comments?.length ?? 0}
        </Text>
      </View>
      <ScrollView className="flex-1 px-lg">
        {isLoading && (
          <Text
            variant="body-small"
            style={{ color: textMuted, marginTop: 16 }}
          >
            불러오는 중...
          </Text>
        )}
        {!isLoading && comments?.length === 0 && (
          <Text
            variant="body-small"
            style={{ color: textMuted, marginTop: 16 }}
          >
            아직 댓글이 없어요. 첫 댓글을 남겨보세요!
          </Text>
        )}
        {comments?.map((comment) => (
          <View key={comment.commentId} className="flex-row gap-md py-md">
            <View
              className="h-[36px] w-[36px] rounded-full"
              style={{ backgroundColor: avatarBg }}
            />
            <View className="flex-1">
              <View className="flex-row items-baseline gap-sm">
                <Text variant="label" style={{ color: textPrimary }}>
                  {comment.deleted
                    ? '삭제된 댓글'
                    : comment.authorId
                      ? `사용자 ${comment.authorId.slice(0, 8)}`
                      : '알 수 없음'}
                </Text>
                <Text variant="caption" style={{ color: textMuted }}>
                  {formatTimeAgo(comment.createdAt)}
                </Text>
              </View>
              <Text
                variant="body-small"
                className="mt-xs"
                style={{ color: textSecondary }}
              >
                {comment.body}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={{ borderTopWidth: 1, borderTopColor: borderColor }}>
        <ReplyBar variant={variant} onSubmit={handleSubmit} />
      </View>
    </View>
  );
}
