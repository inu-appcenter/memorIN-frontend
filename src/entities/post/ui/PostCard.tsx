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

interface PostCardProps {
  post: PostSummary;
  isVisible?: boolean;
  // 데스크탑에서 댓글 아이콘 클릭 시 호출 — 우측 패널을 이 postId로 전환시킨다.
  // 안 넘어오면(스토리 뷰어 등 다른 컨텍스트) 기존처럼 항상 바텀시트를 연다.
  onOpenComments?: (postId: string) => void;
}

function PostCardComponent({
  post,
  isVisible = true,
  onOpenComments,
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

  // 친구 피드에는 다른 사람이 쓴 게시물도 섞여 나오므로, 로그인한 내 프로필이
  // 아니라 게시물 실제 작성자(post.authorId) 기준으로 프로필을 조회한다.
  const { data: authorProfile } = useUserProfileQuery(post.authorId);
  const authorLabel = authorProfile?.displayName ?? post.authorId.slice(0, 8);

  // 수정/삭제 메뉴는 작성자 본인 게시물에서만 노출한다.
  const myId = useAuthStore((s) => s.user?.id);
  const isOwnPost = post.authorId === myId;

  const deletePost = useDeletePost();
  const [commentsSheetVisible, setCommentsSheetVisible] = useState(false);

  const {
    liked,
    count: likeCount,
    toggle: toggleLike,
  } = usePostLikes(post.postId);
  // TODO: PostSummary에 commentCount 필드가 생기면 이 호출(전체 댓글 로딩) 대신
  // 그 필드를 바로 쓰도록 교체 — 지금은 카운트 하나 보여주려고 댓글 전체를 불러옴
  const { data: comments } = useCommentThread(post.postId);
  const commentCount = comments?.length ?? 0;

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
    if (device === 'desktop' && onOpenComments) {
      onOpenComments(post.postId);
      return;
    }
    setCommentsSheetVisible(true);
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
            <UploadIcon width={20} height={20} color={COLORS.tertiary} />
          </View>
        </View>
      </View>
      {/* 데스크탑에서 onOpenComments가 넘어온 경우엔 이 시트를 안 쓰므로 mount는 되지만 항상 닫힌 채로 남는다 */}
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
