import { useInfiniteQuery } from '@tanstack/react-query';
import {
  searchPosts,
  type FeedPage,
  type PostSortType,
  type TagType,
  type TimeslotType,
} from '../api/postsApi';

const PAGE_SIZE = 30;

export interface PostSearchFilters {
  keyword: string;
  tags: TagType[];
  timeslot: TimeslotType | null;
  sort: PostSortType;
}

export const DEFAULT_POST_SEARCH_FILTERS: PostSearchFilters = {
  keyword: '',
  tags: [],
  timeslot: null,
  sort: 'LATEST',
};

export function canSortByAccuracy(
  filters: Pick<PostSearchFilters, 'keyword'>
): boolean {
  return filters.keyword.trim().length > 0;
}

// 검색어를 지우는 경로가 여럿이라 요청 직전에 한 번 더 내린다.
// 서버는 키워드도 태그도 없는 정확도순을 400으로 거절한다.
function resolveSearchSort(filters: PostSearchFilters): PostSortType {
  if (filters.sort !== 'ACCURACY_DESC') return filters.sort;
  return canSortByAccuracy(filters) ? 'ACCURACY_DESC' : 'LATEST';
}

export function useSearchPostsQuery(filters: PostSearchFilters) {
  const sort = resolveSearchSort(filters);

  return useInfiniteQuery<FeedPage>({
    queryKey: ['posts', 'search', { ...filters, sort }],
    queryFn: ({ pageParam }) =>
      searchPosts({
        keyword: filters.keyword.trim() || undefined,
        tags: filters.tags,
        timeslot: filters.timeslot ?? undefined,
        sort,
        cursor: pageParam as string | undefined,
        size: PAGE_SIZE,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}
