import { memo, useMemo, useState } from 'react';
import { Text } from '@/shared/ui/text';
import { Alert, Image, Platform, Pressable, View } from 'react-native';
import type { PostMedia, PostSummary } from '../api/postsApi';
import {
  extractPreviewText,
  formatPostMeta,
  getTagLabel,
  getTimeslotBadgeLabel,
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
import DayIcon from '@/shared/assets/icons/day.svg';
import NightIcon from '@/shared/assets/icons/night.svg';
import { PostShareSheet } from '@/features/post-share';
import { useTranslation } from 'react-i18next';

const FIXED_MEDIA_HEIGHT_PX = 360;

// 폰에서 원본 비율을 쓰되 이 범위를 벗어나면 잘라낸다.
const MIN_MEDIA_ASPECT_RATIO = 3 / 4;
const MAX_MEDIA_ASPECT_RATIO = 16 / 9;

function resolveMediaAspectRatio(media: PostMedia | undefined): number | null {
  if (!media?.width || !media?.height) return null;

  const ratio = media.width / media.height;
  if (!Number.isFinite(ratio) || ratio <= 0) return null;

  return Math.min(
    Math.max(ratio, MIN_MEDIA_ASPECT_RATIO),
    MAX_MEDIA_ASPECT_RATIO
  );
}

function TimeslotBadge({
  timeslot,
  overlay,
}: {
  timeslot: PostSummary['timeslot'];
  overlay: boolean;
}) {
  const label = getTimeslotBadgeLabel(timeslot);
  if (!label) return null;

  const Icon = timeslot === 'PM' ? NightIcon : DayIcon;

  return (
    <View
      className="flex-row items-center gap-xs self-start rounded-full px-md py-xs"
      style={{
        backgroundColor: overlay ? COLORS.surfaceDarkOverlay : COLORS.bgSubtle,
      }}
    >
      <Icon
        width={12}
        height={12}
        color={overlay ? COLORS.surfaceDarkTextPrimary : COLORS.textSecondary}
      />
      <Text
        variant="label"
        className={overlay ? 'text-on-brand' : 'text-secondary'}
      >
        {label}
      </Text>
    </View>
  );
}

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
  const { t } = useTranslation();

  const previewText = extractPreviewText(post.content);
  const coverAttachment = post.attachments[0];
  const coverUrl = coverAttachment
    ? resolveMediaUrl(coverAttachment)
    : undefined;
  const isVideoCover =
    coverAttachment?.contentType.startsWith('video/') ?? false;

  // PostVideoCover가 memo라서 매 렌더마다 새 객체를 넘기면 memo가 무의미해진다.
  const mediaStyle = useMemo(() => {
    const aspectRatio =
      device === 'phone' ? resolveMediaAspectRatio(coverAttachment) : null;

    return aspectRatio
      ? { width: '100%' as const, aspectRatio }
      : { width: '100%' as const, height: FIXED_MEDIA_HEIGHT_PX };
  }, [device, coverAttachment]);

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
  const tags = post.tagTypes ?? [];

  const runDelete = () => {
    deletePost.mutate(post.postId, {
      onError: (error) => {
        const message = (error as Error).message;
        if (Platform.OS === 'web') {
          window.alert(t('post.deleteFailMessage', { message }));
        } else {
          Alert.alert(t('post.deleteFailTitle'), message);
        }
      },
    });
  };

  const handlePressMenu = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('post.deleteConfirm'))) {
        runDelete();
      }
      return;
    }

    Alert.alert(t('post.deleteTitle'), t('post.deleteConfirm'), [
      { text: t('action.cancel'), style: 'cancel' },
      { text: t('action.delete'), style: 'destructive', onPress: runDelete },
    ]);
  };

  const handlePressComments = () => {
    onOpenComments?.(post.postId);
  };

  return (
    <>
      <View className="mb-lg overflow-hidden rounded-lg border border-border bg-page">
        <View className="flex-row items-center justify-between p-lg">
          <View className="flex-row items-center gap-md">
            <View className="h-[34px] w-[34px] rounded-full border border-border bg-subtle" />
            <View className="gap-xs">
              <Text className="font-bold">{authorLabel}</Text>
              <Text variant="label" className="text-muted">
                {formatPostMeta(post.postId, post.recordedDate)}
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

        {coverUrl ? (
          <View className="relative w-full">
            {isVideoCover ? (
              <PostVideoCover
                uri={coverUrl}
                isVisible={isVisible}
                showPlayPauseToggle
                style={mediaStyle}
              />
            ) : (
              <Image
                source={{ uri: coverUrl }}
                className="bg-surface"
                style={mediaStyle}
                resizeMode="cover"
              />
            )}
            <View className="absolute left-md top-md">
              <TimeslotBadge timeslot={post.timeslot} overlay />
            </View>
          </View>
        ) : null}

        <View className="gap-md p-lg">
          {!coverUrl && (
            <TimeslotBadge timeslot={post.timeslot} overlay={false} />
          )}

          {previewText ? (
            <Text className="text-secondary">{previewText}</Text>
          ) : (
            <Text className="text-tertiary">{t('post.emptyContent')}</Text>
          )}

          {tags.length > 0 && (
            <View className="flex-row flex-wrap gap-md">
              {tags.map((tag) => (
                <Text key={tag} className="text-link">
                  #{getTagLabel(tag)}
                </Text>
              ))}
            </View>
          )}

          <View className="flex-row items-center gap-lg">
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
