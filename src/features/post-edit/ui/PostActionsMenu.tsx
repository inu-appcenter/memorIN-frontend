import { useState } from 'react';
import { Alert, Platform, Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { Sheet } from '@/shared/ui/sheet';
import { useDeletePost } from '@/entities/post/model/useDeletePost';
import type { PostSummary } from '@/entities/post/api/postsApi';
import { PostShareSheet } from '@/features/post-share';
import { EditPostSheet } from './EditPostSheet';

interface PostActionsMenuProps {
  post: PostSummary;
  isOwnPost: boolean; // 수정/삭제는 본인 게시물에서만 노출. 공유는 항상 노출.
  variant?: 'dark' | 'light'; // dark = 스토리 뷰어 오버레이 위, light = 일반 화면
  onDeleted?: () => void; // 스토리 뷰어처럼 삭제 후 화면 자체를 닫아야 하는 경우
}

export function PostActionsMenu({
  post,
  isOwnPost,
  variant = 'light',
  onDeleted,
}: PostActionsMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const deletePost = useDeletePost();
  const isDark = variant === 'dark';

  const runDelete = () => {
    setMenuVisible(false);
    deletePost.mutate(post.postId, {
      onSuccess: () => onDeleted?.(),
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : '알 수 없는 오류';
        if (Platform.OS === 'web') {
          window.alert(`삭제 실패: ${message}`);
        } else {
          Alert.alert('삭제 실패', message);
        }
      },
    });
  };

  const handlePressDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('이 게시물을 삭제할까요?')) runDelete();
      return;
    }
    Alert.alert('게시물 삭제', '이 게시물을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: runDelete },
    ]);
  };

  const handlePressEdit = () => {
    setMenuVisible(false);
    setEditVisible(true);
  };

  const handlePressShare = () => {
    setMenuVisible(false);
    setShareVisible(true);
  };

  return (
    <>
      <Pressable onPress={() => setMenuVisible(true)} hitSlop={8}>
        <Text className={isDark ? 'text-white' : 'text-tertiary'}>•••</Text>
      </Pressable>

      <Sheet visible={menuVisible} onClose={() => setMenuVisible(false)}>
        <View style={{ paddingHorizontal: 24, paddingVertical: 8, gap: 4 }}>
          <Pressable onPress={handlePressShare} style={{ paddingVertical: 12 }}>
            <Text variant="body" className="text-primary">
              공유하기
            </Text>
          </Pressable>
          {isOwnPost && (
            <Pressable
              onPress={handlePressEdit}
              style={{ paddingVertical: 12 }}
            >
              <Text variant="body" className="text-primary">
                수정하기
              </Text>
            </Pressable>
          )}
          {isOwnPost && (
            <Pressable
              onPress={handlePressDelete}
              disabled={deletePost.isPending}
              style={{ paddingVertical: 12 }}
            >
              <Text variant="body" className="text-error">
                {deletePost.isPending ? '삭제 중...' : '삭제하기'}
              </Text>
            </Pressable>
          )}
        </View>
      </Sheet>

      {isOwnPost && (
        <EditPostSheet
          key={post.postId}
          visible={editVisible}
          onClose={() => setEditVisible(false)}
          post={post}
        />
      )}

      <PostShareSheet
        post={post}
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
      />
    </>
  );
}
