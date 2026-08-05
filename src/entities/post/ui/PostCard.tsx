import { memo, useState } from 'react';
import { Text } from '@/shared/ui/text';
import { Alert, Image, Platform, Pressable, View } from 'react-native';
import type { PostSummary } from '../api/postsApi';
import {
  extractPreviewText,
  formatRecordedLabel,
  getTimeslotLabel,
} from '../model/postContent';
import { useDeletePost } from '../model/useDeletePost';
import { resolveMediaUrl } from '../lib/resolveMediaUrl';
import { useMyProfile } from '@/entities/session/model/useMyProfile';
import { PostVideoCover } from './PostVideoCover';
import { Sheet } from '@/shared/ui/sheet';
import { CommentThread } from './CommentThread';
import { COLORS } from '@/shared/lib/theme';
import HeartIcon from '@/shared/assets/icons/heart.svg';
import FeedChatIcon from '@/shared/assets/icons/feedChat.svg';
import UploadIcon from '@/shared/assets/icons/upload.svg';

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
  const timeslotLabel = getTimeslotLabel(post.timeslot);

  const { data: profile } = useMyProfile();
  const authorLabel = profile?.displayName ?? post.authorId.slice(0, 8);

  const deletePost = useDeletePost();
  const [commentsSheetVisible, setCommentsSheetVisible] = useState(false);

  const runDelete = () => {
    deletePost.mutate(post.postId, {
      onError: (error) => {
        const message = (error as Error).message;
        if (Platform.OS === 'web') {
          window.alert(`삭제 실패: ${message}`);
        } else {
          Alert.alert('삭제 실패', message);
        }
      },
    });
  };

  const handlePressMenu = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('이 게시물을 삭제할까요?')) {
        runDelete();
      }
      return;
    }

    Alert.alert('게시물 삭제', '이 게시물을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: runDelete },
    ]);
  };

  return (
    <>
      <View className="mb-lg overflow-hidden rounded-lg border border-border bg-page">
        <View className="gap-sm p-lg">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-md">
              <View className="h-[34px] w-[34px] rounded-full border border-border bg-subtle" />
              <View>
                <Text className="font-bold">{authorLabel}</Text>
                <Text className="text-muted">
                  {formatRecordedLabel(post.recordedDate, post.timeslot)}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={handlePressMenu}
              disabled={deletePost.isPending}
              hitSlop={8}
            >
              <Text className="text-tertiary">•••</Text>
            </Pressable>
          </View>
          {timeslotLabel && (
            <View className="self-start rounded-full bg-accent-subtle px-sm py-xs">
              <Text className="text-accent-text">{timeslotLabel}</Text>
            </View>
          )}
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
            {/* 좋아요 수 API 미제공 상태라 아이콘만 표시 */}
            <HeartIcon width={20} height={20} color={COLORS.tertiary} />
            <Pressable
              onPress={() => setCommentsSheetVisible(true)}
              hitSlop={8}
            >
              <FeedChatIcon width={20} height={20} color={COLORS.tertiary} />
            </Pressable>
            <UploadIcon width={20} height={20} color={COLORS.tertiary} />
          </View>
        </View>
      </View>
      <Sheet
        visible={commentsSheetVisible}
        onClose={() => setCommentsSheetVisible(false)}
        className="h-[70%]"
      >
        <CommentThread postId={post.postId} />
      </Sheet>
    </>
  );
}

export const PostCard = memo(PostCardComponent);
