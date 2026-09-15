import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import BackArrowIcon from '@/shared/assets/icons/back-arrow.svg';
import HeartIcon from '@/shared/assets/icons/heart.svg';
import HeartFilled2Icon from '@/shared/assets/icons/heartFilled2.svg';
import FeedChatIcon from '@/shared/assets/icons/feedChat.svg';
import {
  CommentThread,
  PostMediaPager,
  usePostQuery,
  type PostDetail,
} from '@/entities/post';
import {
  extractPreviewText,
  formatRecordedLabel,
  getTimeslotLabel,
} from '@/entities/post/model/postContent';
import { usePostLikes } from '@/entities/post/model/usePostLikes';
import { useCommentThread } from '@/entities/post/model/useComments';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { useUserProfileQuery } from '@/entities/user';
import { PostActionsMenu } from '@/features/post-edit';

const DESKTOP_INFO_WIDTH = 380;
const TABLET_INFO_WIDTH = 320;
const WIDE_MAX_WIDTH = 1100;
const CAPTION_MAX_LINES = 6;
const PHONE_MEDIA_MAX_HEIGHT_RATIO = 0.42;

interface PostDetailPageProps {
  postId: string;
}

function PostInfo({
  post,
  onDeleted,
}: {
  post: PostDetail;
  onDeleted: () => void;
}) {
  const { t } = useTranslation();
  const { data: authorProfile } = useUserProfileQuery(post.authorId);
  const authorLabel = authorProfile?.displayName ?? post.authorId.slice(0, 8);

  const myId = useAuthStore((s) => s.user?.id);
  const isOwnPost = post.authorId === myId;

  const previewText = extractPreviewText(post.content);
  const timeslotLabel = getTimeslotLabel(post.timeslot);

  const {
    liked,
    count: likeCount,
    toggle: toggleLike,
  } = usePostLikes(post.postId);
  const { data: comments } = useCommentThread(post.postId);
  const commentCount = comments?.length ?? 0;

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between border-b border-border p-lg">
        <View className="flex-1 flex-row items-center gap-md">
          <View className="h-[34px] w-[34px] rounded-full border border-border bg-subtle" />
          <View className="flex-1">
            <Text className="font-bold">{authorLabel}</Text>
            <Text className="text-muted">
              {formatRecordedLabel(post.recordedDate, post.timeslot)}
            </Text>
          </View>
        </View>
        {/* 삭제되면 이 화면 자체가 사라져야 한다 */}
        <PostActionsMenu
          post={post}
          isOwnPost={isOwnPost}
          onDeleted={onDeleted}
        />
      </View>

      <View className="gap-md border-b border-border p-lg">
        {timeslotLabel && (
          <View className="self-start rounded-full bg-accent-subtle px-sm py-xs">
            <Text className="text-accent-text">{timeslotLabel}</Text>
          </View>
        )}
        {previewText ? (
          <Text className="text-secondary" numberOfLines={CAPTION_MAX_LINES}>
            {previewText}
          </Text>
        ) : (
          <Text className="text-tertiary">{t('post.emptyContent')}</Text>
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
          <View className="flex-row items-center gap-xs">
            <FeedChatIcon width={20} height={20} color={COLORS.tertiary} />
            <Text className="text-tertiary">{commentCount}</Text>
          </View>
        </View>
      </View>

      <View className="flex-1">
        <CommentThread postId={post.postId} />
      </View>
    </View>
  );
}

// 게시물 단독 화면. 그리드·검색·알림에서 들어오며 URL이 생겨 공유와
// 뒤로가기가 성립한다. 태그는 백엔드 PostResponse에 없어 여기서는 못 보여준다.
export function PostDetailPage({ postId }: PostDetailPageProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { device } = useBreakpoints();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const {
    data: post,
    isLoading,
    isError,
    error,
    refetch,
  } = usePostQuery(postId);

  // 알림이나 공유 링크로 바로 들어오면 되돌아갈 화면이 없다.
  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace('/feed');

  const isPhone = device === 'phone';

  return (
    <View className="flex-1 bg-page">
      <View className="h-[56px] flex-row items-center gap-md border-b border-border px-lg">
        <Pressable onPress={goBack} hitSlop={8}>
          <BackArrowIcon width={20} height={20} color={COLORS.text} />
        </Pressable>
        <Text variant="heading">{t('postDetail.title')}</Text>
      </View>

      {isLoading && (
        <View className="items-center py-3xl">
          <ActivityIndicator color={COLORS.brand} />
        </View>
      )}

      {isError && (
        <View className="items-center gap-sm py-3xl">
          <Text className="text-error">{(error as Error).message}</Text>
          <Pressable onPress={() => refetch()}>
            <Text className="font-bold text-link">{t('feed.retry')}</Text>
          </Pressable>
        </View>
      )}

      {post && isPhone && (
        <>
          <View
            style={{
              width: '100%',
              height: Math.min(
                windowWidth,
                windowHeight * PHONE_MEDIA_MAX_HEIGHT_RATIO
              ),
            }}
          >
            <PostMediaPager attachments={post.attachments} />
          </View>
          <View className="flex-1">
            <PostInfo post={post} onDeleted={goBack} />
          </View>
        </>
      )}

      {post && !isPhone && (
        <View
          className="w-full flex-1 flex-row self-center"
          style={{ maxWidth: WIDE_MAX_WIDTH }}
        >
          <PostMediaPager attachments={post.attachments} />
          <View
            className="border-l border-border"
            style={{
              width:
                device === 'desktop' ? DESKTOP_INFO_WIDTH : TABLET_INFO_WIDTH,
            }}
          >
            <PostInfo post={post} onDeleted={goBack} />
          </View>
        </View>
      )}
    </View>
  );
}
