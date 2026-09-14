import { useState } from 'react';
import { Modal, Pressable, useWindowDimensions, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import {
  extractPreviewText,
  formatRecordedLabel,
  getTimeslotLabel,
} from '@/entities/post/model/postContent';
import { usePostLikes } from '@/entities/post/model/usePostLikes';
import { useCommentThread } from '@/entities/post/model/useComments';
import { CommentThread } from '@/entities/post';
import type { PostSummary } from '@/entities/post/api/postsApi';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { useUserProfileQuery } from '@/entities/user';
import { PostActionsMenu } from '@/features/post-edit';
import HeartIcon from '@/shared/assets/icons/heart.svg';
import HeartFilled2Icon from '@/shared/assets/icons/heartFilled2.svg';
import FeedChatIcon from '@/shared/assets/icons/feedChat.svg';
import { useTranslation } from 'react-i18next';
import { PostMediaPager } from '@/entities/post/ui/PostMediaPager';

interface PostDetailModalProps {
  posts: PostSummary[];
  startIndex: number;
  onClose: () => void;
}

const DESKTOP_INFO_WIDTH = 380;
const TABLET_INFO_WIDTH = 320;
const CARD_MAX_WIDTH = 1100;
const CARD_MAX_HEIGHT = 760;
const CAPTION_MAX_LINES = 6;
const ARROW_EDGE_INSET = 24;
const PHONE_MEDIA_MAX_HEIGHT_RATIO = 0.42;

function NavArrow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      className="h-[40px] w-[40px] items-center justify-center rounded-full bg-black/50 active:bg-black/70"
    >
      <Text className="text-white">{label}</Text>
    </Pressable>
  );
}

function PostInfoPanel({
  post,
  onClose,
  showClose,
}: {
  post: PostSummary;
  onClose: () => void;
  showClose: boolean;
}) {
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
  const { t } = useTranslation();

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
        <View className="flex-row items-center gap-md">
          {/* 삭제되면 모달 자체를 닫아야 한다 — 지워진 게시물이 남아 있으면 안 됨 */}
          <PostActionsMenu
            post={post}
            isOwnPost={isOwnPost}
            onDeleted={onClose}
          />
          {showClose && (
            <Pressable onPress={onClose} hitSlop={8}>
              <Text className="text-secondary">✕</Text>
            </Pressable>
          )}
        </View>
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

// 그리드 썸네일을 눌렀을 때 뜨는 게시물 상세 모달.
// 데스크탑/테블릿은 인스타그램처럼 가운데 카드(미디어 왼쪽 + 정보·댓글 오른쪽),
// 폰은 전체 화면으로 위에서 아래로 쌓는다.
export function PostDetailModal({
  posts,
  startIndex,
  onClose,
}: PostDetailModalProps) {
  const { device } = useBreakpoints();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [index, setIndex] = useState(startIndex);
  const { t } = useTranslation();
  const post = posts[index];
  // 게시물이 삭제되면 목록이 줄어 인덱스가 범위를 벗어날 수 있다(그땐 아무것도 안 그린다)
  if (!post) return null;

  const canPrev = index > 0;
  const canNext = index < posts.length - 1;
  const goPrev = () => setIndex((current) => Math.max(0, current - 1));
  const goNext = () =>
    setIndex((current) => Math.min(posts.length - 1, current + 1));

  if (device === 'phone') {
    return (
      <Modal
        visible
        transparent={false}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-page">
          <View className="h-[52px] flex-row items-center justify-between border-b border-border px-lg">
            <View className="flex-row items-center gap-md">
              <Pressable onPress={onClose} hitSlop={8}>
                <Text className="text-secondary">✕</Text>
              </Pressable>
              <Text variant="heading">{t('postDetail.title')}</Text>
            </View>
            {/* 폰에서는 화면 폭이 좁아 오버레이 대신 헤더 우측에 이동 버튼을 둔다 */}
            <View className="flex-row items-center gap-lg">
              <Pressable onPress={goPrev} disabled={!canPrev} hitSlop={8}>
                <Text className={canPrev ? 'text-secondary' : 'text-tertiary'}>
                  ◀
                </Text>
              </Pressable>
              <Pressable onPress={goNext} disabled={!canNext} hitSlop={8}>
                <Text className={canNext ? 'text-secondary' : 'text-tertiary'}>
                  ▶
                </Text>
              </Pressable>
            </View>
          </View>
          <View
            style={{
              width: '100%',
              height: Math.min(
                windowWidth,
                windowHeight * PHONE_MEDIA_MAX_HEIGHT_RATIO
              ),
            }}
          >
            {/* postId를 key로 줘서 게시물을 넘길 때 페이저 내부 상태(현재 장)가 초기화되게 한다 */}
            <PostMediaPager key={post.postId} attachments={post.attachments} />
          </View>
          <View className="flex-1">
            <PostInfoPanel post={post} onClose={onClose} showClose={false} />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center p-xl">
        {/* 배경 클릭으로도 닫힌다 */}
        <Pressable
          onPress={onClose}
          className="bg-black/60"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View
          className="w-full flex-row overflow-hidden rounded-lg border border-border bg-page"
          style={{
            maxWidth: CARD_MAX_WIDTH,
            height: '90%',
            maxHeight: CARD_MAX_HEIGHT,
          }}
        >
          <PostMediaPager key={post.postId} attachments={post.attachments} />
          <View
            className="border-l border-border"
            style={{
              width:
                device === 'desktop' ? DESKTOP_INFO_WIDTH : TABLET_INFO_WIDTH,
            }}
          >
            <PostInfoPanel post={post} onClose={onClose} showClose />
          </View>
        </View>
        {/* 카드 위에 겹치는 좌우 이동 버튼. box-none이라 버튼 밖 클릭은 배경(닫기)으로 통과한다 */}
        <View
          pointerEvents="box-none"
          className="flex-row items-center justify-between"
          style={{
            position: 'absolute',
            left: ARROW_EDGE_INSET,
            right: ARROW_EDGE_INSET,
            top: 0,
            bottom: 0,
          }}
        >
          {canPrev ? <NavArrow label="◀" onPress={goPrev} /> : <View />}
          {canNext ? <NavArrow label="▶" onPress={goNext} /> : <View />}
        </View>
      </View>
    </Modal>
  );
}
