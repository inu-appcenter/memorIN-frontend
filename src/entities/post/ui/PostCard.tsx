import { memo } from 'react';
import { Text } from '@/shared/ui/text';
import { Image, View } from 'react-native';
import type { PostSummary } from '../api/postsApi';
import { extractPreviewText, formatRecordedLabel } from '../model/postContent';
import { resolveMediaUrl } from '../lib/resolveMediaUrl';
import { PostVideoCover } from './PostVideoCover';

interface PostCardProps {
  post: PostSummary;
  isVisible?: boolean;
}

function PostCardComponent({ post, isVisible = true }: PostCardProps) {
  const previewText = extractPreviewText(post.content);
  const coverAttachment = post.attachments[0];
  const coverUrl = coverAttachment
    ? resolveMediaUrl(coverAttachment)
    : undefined;
  const isVideoCover =
    coverAttachment?.contentType.startsWith('video/') ?? false;

  return (
    <View className="mb-lg overflow-hidden rounded-lg border border-border bg-page">
      <View className="gap-sm p-lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-md">
            <View className="h-[34px] w-[34px] rounded-full border border-border bg-subtle" />
            <View>
              {/* 작성자 표시 이름 조회 API(/api/users/{id})가 아직 없어 authorId만 표시 */}
              <Text className="font-bold">{post.authorId.slice(0, 8)}</Text>
              <Text className="text-muted">
                {formatRecordedLabel(post.recordedDate, post.timeslot)}
              </Text>
            </View>
          </View>
          <Text className="text-tertiary">•••</Text>
        </View>
      </View>
      {coverUrl && isVideoCover ? (
        <PostVideoCover uri={coverUrl} isVisible={isVisible} />
      ) : coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          className="h-[360px] w-full bg-surface"
          resizeMode="cover"
        />
      ) : (
        <View className="h-[360px] items-center justify-center border-y border-dashed border-border bg-surface">
          <Text className="text-tertiary">IMG</Text>
        </View>
      )}
      <View className="gap-md p-lg">
        {previewText ? (
          <Text className="text-secondary">{previewText}</Text>
        ) : (
          <Text className="text-tertiary">내용 없음</Text>
        )}
        <View className="flex-row gap-xl">
          {/* 좋아요/댓글 수 API 미제공 상태라 아이콘만 표시 */}
          <Text className="text-tertiary">♡</Text>
          <Text className="text-tertiary">○</Text>
          <Text className="text-tertiary">⇧</Text>
        </View>
      </View>
    </View>
  );
}

// [변경] props(post, isVisible)가 안 바뀐 카드는 리렌더 건너뛰도록 memo 적용
export const PostCard = memo(PostCardComponent);
