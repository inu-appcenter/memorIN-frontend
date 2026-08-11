import { useInfiniteQuery } from '@tanstack/react-query';
import { searchUsers } from '../api/userApi';

// keyword가 비어있으면 호출하지 않는다
// 커서 기반 무한 스크롤
export function useUserSearchQuery(keyword: string) {
  const trimmed = keyword.trim();

  return useInfiniteQuery({
    queryKey: ['users', 'search', trimmed],
    queryFn: ({ pageParam }) =>
      searchUsers(trimmed, {
        cursor: pageParam as string | undefined,
        size: 20,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: trimmed.length > 0,
    staleTime: 30 * 1000,
  });
}
