import { useState } from 'react';
import { Alert, Platform, Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { Sheet } from '@/shared/ui/sheet';
import { useDeletePost } from '@/entities/post/model/useDeletePost';
import type { PostSummary } from '@/entities/post/api/postsApi';
import { EditPostSheet } from './EditPostSheet';

interface PostActionsMenuProps {
  post: PostSummary;
  variant?: 'dark' | 'light'; // dark = 스토리 뷰어 오버레이 위, light = 일반 화면
  onDeleted?: () => void; // 스토리 뷰어처럼 삭제 후 화면 자체를 닫아야 하는 경우
}

// "•••" 트리거 + 수정/삭제 액션 시트. DayDetailContent, StoryViewer에서 공용으로 쓴다.
export function PostActionsMenu({
  post,
  variant = 'light',
  onDeleted,
}: PostActionsMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
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

  return (
    <>
      <Pressable onPress={() => setMenuVisible(true)} hitSlop={8}>
        <Text className={isDark ? 'text-white' : 'text-tertiary'}>•••</Text>
      </Pressable>

      <Sheet visible={menuVisible} onClose={() => setMenuVisible(false)}>
        <View className="gap-xs">
          <Pressable onPress={handlePressEdit} className="py-md">
            <Text variant="body" className="text-primary">
              수정하기
            </Text>
          </Pressable>
          <Pressable
            onPress={handlePressDelete}
            disabled={deletePost.isPending}
            className="py-md"
          >
            <Text variant="body" className="text-error">
              {deletePost.isPending ? '삭제 중...' : '삭제하기'}
            </Text>
          </Pressable>
        </View>
      </Sheet>

      <EditPostSheet
        key={post.postId}
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        post={post}
      />
    </>
  );
}
