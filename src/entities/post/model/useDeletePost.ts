import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost, type FeedPage } from '../api/postsApi';

interface InfiniteFeedData {
  pages: FeedPage[];
  pageParams: unknown[];
}

// 삭제 성공 시 피드 캐시는 재조회 없이 바로 제거(스크롤 위치 유지),
// 캘린더 캐시는 페이지 구조가 달라(무한 스크롤 아님) 그냥 invalidate로 재조회한다.
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
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}
