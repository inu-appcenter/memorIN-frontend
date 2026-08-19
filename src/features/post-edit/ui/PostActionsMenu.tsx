import { useState } from 'react';
import { Alert, Platform, Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { Sheet } from '@/shared/ui/sheet';
import { useDeletePost } from '@/entities/post/model/useDeletePost';
import type { PostSummary } from '@/entities/post/api/postsApi';
import { PostShareSheet } from '@/features/post-share';
import { EditPostSheet } from './EditPostSheet';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
          error instanceof Error ? error.message : t('postEdit.unknownError');
        if (Platform.OS === 'web') {
          window.alert(t('post.deleteFailMessage', { message }));
        } else {
          Alert.alert(t('post.deleteFailTitle'), message);
        }
      },
    });
  };

  const handlePressDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('post.deleteConfirm'))) runDelete();
      return;
    }
    Alert.alert(t('post.deleteTitle'), t('post.deleteConfirm'), [
      { text: t('action.cancel'), style: 'cancel' },
      { text: t('action.delete'), style: 'destructive', onPress: runDelete },
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
              {t('postEdit.menuShare')}
            </Text>
          </Pressable>
          {isOwnPost && (
            <Pressable
              onPress={handlePressEdit}
              style={{ paddingVertical: 12 }}
            >
              <Text variant="body" className="text-primary">
                {t('postEdit.menuEdit')}
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
                {deletePost.isPending
                  ? t('postEdit.menuDeleting')
                  : t('postEdit.menuDelete')}
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
