import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost, type FeedPage } from '../api/postsApi';

interface InfiniteFeedData {
  pages: FeedPage[];
  pageParams: unknown[];
}

// 삭제 성공 시 재조회 없이 캐시에서 해당 게시물만 바로 제거 (스크롤 위치 유지)
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: (_data, postId) => {
      queryClient.setQueriesData<InfiniteFeedData>(
        { queryKey: ['feed'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((item) => item.postId !== postId),
            })),
          };
        }
      );
    },
  });
}
