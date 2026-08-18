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
import { useCommentThread } from '../model/useComments';
import { usePostLikes } from '../model/usePostLikes';
import { resolveMediaUrl } from '../lib/resolveMediaUrl';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { useUserProfileQuery } from '@/entities/user';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { PostVideoCover } from './PostVideoCover';
import { Sheet } from '@/shared/ui/sheet';
import { CommentThread } from './CommentThread';
import { COLORS } from '@/shared/lib/theme';
import HeartIcon from '@/shared/assets/icons/heart.svg';
import HeartFilled2Icon from '@/shared/assets/icons/heartFilled2.svg';
import FeedChatIcon from '@/shared/assets/icons/feedChat.svg';
import UploadIcon from '@/shared/assets/icons/upload.svg';
import { PostShareSheet } from '@/features/post-share';

interface PostCardProps {
  post: PostSummary;
  isVisible?: boolean;
  // 이 게시물의 댓글이 현재 열려 있는지 — FeedPage가 device와 무관하게 하나의
  // activeCommentsPostId로 관리한다. 이 값과 현재 device를 조합해서 매 렌더마다
  // 시트를 띄울지 다시 계산하기 때문에, 열어둔 채로 폭이 바뀌어도(데스크탑 분할
  // 패널 ↔ 폰/태블릿 바텀시트) 자동으로 맞는 쪽으로 전환된다.
  isCommentsActive?: boolean;
  onOpenComments?: (postId: string) => void;
  onCloseComments?: () => void;
}

function PostCardComponent({
  post,
  isVisible = true,
  isCommentsActive = false,
  onOpenComments,
  onCloseComments,
}: PostCardProps) {
  const { device } = useBreakpoints();
  const previewText = extractPreviewText(post.content);
  const coverAttachment = post.attachments[0];
  const coverUrl = coverAttachment
    ? resolveMediaUrl(coverAttachment)
    : undefined;
  const isVideoCover =
    coverAttachment?.contentType.startsWith('video/') ?? false;
  const timeslotLabel = getTimeslotLabel(post.timeslot);

  const { data: authorProfile } = useUserProfileQuery(post.authorId);
  const authorLabel = authorProfile?.displayName ?? post.authorId.slice(0, 8);

  const myId = useAuthStore((s) => s.user?.id);
  const isOwnPost = post.authorId === myId;

  const deletePost = useDeletePost();
  const [shareVisible, setShareVisible] = useState(false);

  const {
    liked,
    count: likeCount,
    toggle: toggleLike,
  } = usePostLikes(post.postId);
  const { data: comments } = useCommentThread(post.postId);
  const commentCount = comments?.length ?? 0;

  const showCommentsSheet = isCommentsActive && device !== 'desktop';

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

  const handlePressComments = () => {
    onOpenComments?.(post.postId);
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
            {isOwnPost && (
              <Pressable
                onPress={handlePressMenu}
                disabled={deletePost.isPending}
                hitSlop={8}
              >
                <Text className="text-tertiary">•••</Text>
              </Pressable>
            )}
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
          <View className="flex-row items-center gap-xl">
            <Pressable
              onPress={toggleLike}
              hitSlop={8}
              className="flex-row items-center gap-xs"
            >
              {liked ? (
                <HeartFilled2Icon width={20} height={20} color={COLORS.error} />
              ) : (
                <HeartIcon width={20} height={20} color={COLORS.tertiary} />
              )}
              <Text className="text-tertiary">{likeCount}</Text>
            </Pressable>
            <Pressable
              onPress={handlePressComments}
              hitSlop={8}
              className="flex-row items-center gap-xs"
            >
              <FeedChatIcon width={20} height={20} color={COLORS.tertiary} />
              <Text className="text-tertiary">{commentCount}</Text>
            </Pressable>
            <Pressable onPress={() => setShareVisible(true)} hitSlop={8}>
              <UploadIcon width={20} height={20} color={COLORS.tertiary} />
            </Pressable>
          </View>
        </View>
      </View>
      <Sheet
        visible={showCommentsSheet}
        onClose={() => onCloseComments?.()}
        className="h-[70%]"
      >
        <CommentThread postId={post.postId} />
      </Sheet>
      <PostShareSheet
        post={post}
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
      />
    </>
  );
}

export const PostCard = memo(PostCardComponent);
