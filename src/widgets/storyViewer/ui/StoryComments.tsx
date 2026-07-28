import { ScrollView, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import type { StoryComment } from '@/shared/config/mockComments';
import { COLORS } from '@/shared/lib/theme';
import { ReplyBar } from '@/shared/ui/replyBar';

interface StoryCommentsProps {
  comments: StoryComment[];
  onSubmit: (text: string) => void;
  variant?: 'dark' | 'light'; // 데스크탑 패널은 dark, 테블릿/폰 바텀시트는 light
}

export function StoryComments({
  comments,
  onSubmit,
  variant = 'light',
}: StoryCommentsProps) {
  const isDark = variant === 'dark';
  const bg = isDark ? COLORS.neutral600 : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.15)' : '#DADCE3';
  const textPrimary = isDark ? '#FFFFFF' : '#131519';
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : '#8A8F9C';
  const textSecondary = isDark ? 'rgba(255,255,255,0.7)' : '#333740';
  const avatarBg = isDark ? 'rgba(255,255,255,0.15)' : '#EDEEF2';

  return (
    <View className="flex-1" style={{ backgroundColor: bg }}>
      <View
        className="p-lg"
        style={{ borderBottomWidth: 1, borderBottomColor: borderColor }}
      >
        <Text variant="label" style={{ color: textPrimary }}>
          댓글 {comments.length}
        </Text>
      </View>
      <ScrollView className="flex-1 px-lg">
        {comments.map((comment) => (
          <View key={comment.id} className="flex-row gap-md py-md">
            <View
              className="h-[36px] w-[36px] rounded-full"
              style={{ backgroundColor: avatarBg }}
            />
            <View className="flex-1">
              <View className="flex-row items-baseline gap-sm">
                <Text variant="label" style={{ color: textPrimary }}>
                  {comment.author}
                </Text>
                <Text variant="caption" style={{ color: textMuted }}>
                  {comment.timeAgo}
                </Text>
              </View>
              <Text
                variant="body-small"
                className="mt-xs"
                style={{ color: textSecondary }}
              >
                {comment.text}
              </Text>
            </View>
            <Text variant="caption" style={{ color: textMuted }}>
              ♡{comment.likes > 0 ? ` ${comment.likes}` : ''}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={{ borderTopWidth: 1, borderTopColor: borderColor }}>
        <ReplyBar variant={variant} onSubmit={onSubmit} />
      </View>
    </View>
  );
}
