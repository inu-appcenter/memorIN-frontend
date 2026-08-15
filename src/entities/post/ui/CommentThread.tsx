import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { useCommentThread, useCreateComment } from '../model/useComments';
import { getSurfaceColors } from '@/shared/lib/theme';
import { ReplyBar } from '@/shared/ui/replyBar';
import { ReactionBar } from '@/entities/reaction';

interface CommentThreadProps {
  postId: string;
  variant?: 'dark' | 'light';
  polling?: boolean;
  onClose?: () => void;
}

const POLLING_INTERVAL_MS = 5000;

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

export function CommentThread({
  postId,
  variant = 'light',
  polling = false,
  onClose,
}: CommentThreadProps) {
  const {
    background: bg,
    border: borderColor,
    textPrimary,
    textSecondary,
    textMuted,
    avatarBackground: avatarBg,
  } = getSurfaceColors(variant);

  const { data: comments, isLoading } = useCommentThread(postId, {
    refetchInterval: polling ? POLLING_INTERVAL_MS : undefined,
  });
  const createComment = useCreateComment(postId);

  const handleSubmit = (text: string) => {
    createComment.mutate(text);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: bg }}>
      <View
        className="h-[48px] flex-row items-center justify-between px-lg"
        // style={{ borderBottomWidth: 1, borderBottomColor: borderColor }}
      >
        <Text variant="label" style={{ color: textPrimary }}>
          댓글 {comments?.length ?? 0}
        </Text>
        {onClose && (
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={{ color: textMuted }}>✕</Text>
          </Pressable>
        )}
      </View>
      <ScrollView className="flex-1 px-lg" showsVerticalScrollIndicator={false}>
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
          <ReactionBar
            key={comment.commentId}
            postId={postId}
            commentId={comment.commentId}
            emojis={comment.emojis}
          >
            <View className="flex-row gap-md py-md">
              <View
                className="h-[36px] w-[36px] rounded-full"
                style={{ backgroundColor: avatarBg }}
              />
              <View className="flex-1">
                <View className="flex-row items-baseline gap-sm">
                  <Text variant="label" style={{ color: textPrimary }}>
                    {comment.deleted
                      ? '삭제된 댓글'
                      : (comment.authorDisplayName ??
                        comment.authorUsername ??
                        '알 수 없음')}
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
          </ReactionBar>
        ))}
      </ScrollView>
      <View style={{ borderTopWidth: 1, borderTopColor: borderColor }}>
        <ReplyBar variant={variant} onSubmit={handleSubmit} />
      </View>
    </View>
  );
}
