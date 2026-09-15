import { useQuery } from '@tanstack/react-query';
import { getPost, type PostDetail } from '../api/postsApi';

export function usePostQuery(postId: string | undefined) {
  return useQuery<PostDetail>({
    queryKey: ['posts', 'detail', postId],
    queryFn: () => getPost(postId as string),
    enabled: Boolean(postId),
  });
}
