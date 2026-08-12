import { useState } from 'react';
import { Image, Modal, Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import {
  extractPreviewText,
  getTimeslotLabel,
} from '@/entities/post/model/postContent';
import { resolveMediaUrl } from '@/entities/post/lib/resolveMediaUrl';
import { PostVideoCover } from '@/entities/post/ui/PostVideoCover';
import type { PostSummary } from '@/entities/post/api/postsApi';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { useUserProfileQuery } from '@/entities/user';
import { Sheet } from '@/shared/ui/sheet';
import { PostActionsMenu } from '@/features/post-edit';
import { StoryProgressBar } from './StoryProgressBar';
import { CommentThread } from '@/entities/post';

interface StoryViewerProps {
  posts: PostSummary[];
  startIndex: number;
  onClose: () => void;
}

const IMAGE_SEGMENT_DURATION_MS = 5000;

// 오전/오후 두 기록을 하나의 스토리처럼 넘겨보는 뷰어.
// 미디어는 배경 전체를 채우고, 진행바/헤더/캡션/입력줄은 그 위에 오버레이된다.
export function StoryViewer({ posts, startIndex, onClose }: StoryViewerProps) {
  const { device } = useBreakpoints();
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [videoDurationMs, setVideoDurationMs] = useState<number | null>(null);
  const [commentsSheetVisible, setCommentsSheetVisible] = useState(false);

  const post = posts[activeIndex];
  // 게시물 실제 작성자(post.authorId) 기준으로 조회 — 로그인한 내 프로필로
  // 고정하지 않는다 (친구 피드 게시물도 이 뷰어로 열릴 수 있음).
  const { data: authorProfile } = useUserProfileQuery(post?.authorId);
  const myId = useAuthStore((s) => s.user?.id);

  if (!post) return null;

  const attachment = post.attachments[0];
  const isVideo = attachment?.contentType?.startsWith('video/');
  const mediaUrl = attachment ? resolveMediaUrl(attachment) : undefined;
  const segmentDurationMs = isVideo
    ? videoDurationMs
    : IMAGE_SEGMENT_DURATION_MS;
  const authorLabel = authorProfile?.displayName ?? post.authorId.slice(0, 8);
  // 수정/삭제 메뉴는 작성자 본인 게시물에서만 노출한다.
  const isOwnPost = post.authorId === myId;

  const goPrev = () => {
    setVideoDurationMs(null);
    setActiveIndex((i) => Math.max(i - 1, 0));
  };
  const goNext = () => {
    if (activeIndex >= posts.length - 1) {
      onClose();
      return;
    }
    setVideoDurationMs(null);
    setActiveIndex((i) => i + 1);
  };

  const showCommentsPanel = device === 'desktop';

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 flex-row bg-black">
        <View style={{ flex: 1, position: 'relative' }}>
          {/* 미디어: 이 영역 전체를 꽉 채우고 맨 뒤에 깔림 */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {mediaUrl ? (
              isVideo ? (
                <PostVideoCover
                  uri={mediaUrl}
                  isVisible
                  nativeControls={false}
                  onDurationLoaded={setVideoDurationMs}
                  style={{ height: '100%', width: '100%' }}
                />
              ) : (
                <Image
                  source={{ uri: mediaUrl }}
                  style={{ height: '100%', width: '100%' }}
                  resizeMode="cover"
                />
              )
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-white/50">
                  기록에 첨부된 미디어가 없어요
                </Text>
              </View>
            )}
          </View>

          {/* 좌우 이동 화살표: 미디어 위, 세로 중앙 */}
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
            }}
          >
            {activeIndex > 0 ? (
              <Pressable
                onPress={goPrev}
                hitSlop={12}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <Text className="text-white">‹</Text>
              </Pressable>
            ) : (
              <View />
            )}
            {activeIndex < posts.length - 1 ? (
              <Pressable
                onPress={goNext}
                hitSlop={12}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <Text className="text-white">›</Text>
              </Pressable>
            ) : (
              <View />
            )}
          </View>

          {/* 상단 오버레이: 진행바 + 헤더 */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <StoryProgressBar
              count={posts.length}
              activeIndex={activeIndex}
              durationMs={segmentDurationMs}
              onComplete={goNext}
            />
            <View className="flex-row items-center justify-between px-md pb-sm">
              <View className="flex-row items-center gap-md">
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }}
                />
                <View>
                  <Text variant="label" className="text-white">
                    {authorLabel}
                  </Text>
                  <Text variant="caption" className="text-white/60">
                    {getTimeslotLabel(post.timeslot)} 기록
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-lg">
                {isOwnPost && (
                  <PostActionsMenu
                    post={post}
                    variant="dark"
                    onDeleted={onClose}
                  />
                )}
                <Pressable onPress={onClose} hitSlop={8}>
                  <Text variant="heading" className="text-white">
                    ×
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* 하단 오버레이: 캡션 + 입력줄 */}
          <View
            className="gap-sm p-md"
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
          >
            <Text variant="body-small" className="text-white">
              {extractPreviewText(post.content)}
            </Text>
            {!showCommentsPanel && (
              <Pressable
                onPress={() => setCommentsSheetVisible(true)}
                style={{
                  height: 44,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)',
                  paddingHorizontal: 16,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }}
                />
                <Text
                  variant="body-small"
                  style={{ flex: 1, color: 'rgba(255,255,255,0.6)' }}
                >
                  댓글 보기
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {showCommentsPanel && (
          <View
            style={{
              width: 320,
              borderLeftWidth: 1,
              borderLeftColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <CommentThread postId={post.postId} variant="dark" />
          </View>
        )}
      </View>

      {!showCommentsPanel && (
        <Sheet
          visible={commentsSheetVisible}
          onClose={() => setCommentsSheetVisible(false)}
          className="h-[70%]"
        >
          <CommentThread postId={post.postId} />
        </Sheet>
      )}
    </Modal>
  );
}
