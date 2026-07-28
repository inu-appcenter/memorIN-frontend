import { useQuery } from '@tanstack/react-query';
import { getMyFeed, type PostSummary } from '@/entities/post/api/postsApi';

const MAX_PAGES = 20; // 안전장치: 최대 400개 게시물까지만 순회

// 이번 달에 속한 게시물 목록을 반환한다.
// 백엔드 GET /api/posts가 날짜 범위 필터를 지원하지 않아서, 커서 페이지네이션으로
// 전체 피드를 순회하며 해당 월에 속하는 게시물만 모으는 임시 방식이다.
// 게시물이 많아지면 비효율적 — 백엔드에 GET /api/posts?from=&to= 같은
// 범위 조회 엔드포인트 추가를 요청해야 한다.
export function useMonthPosts(year: number, month: number) {
  return useQuery({
    queryKey: ['calendar', 'month-posts', year, month],
    queryFn: async () => {
      const posts: PostSummary[] = [];
      let cursor: string | undefined;

      for (let page = 0; page < MAX_PAGES; page++) {
        const result = await getMyFeed({ cursor, size: 20 });
        for (const post of result.items) {
          const recorded = new Date(`${post.recordedDate}T00:00:00`);
          if (
            recorded.getFullYear() === year &&
            recorded.getMonth() === month
          ) {
            posts.push(post);
          }
        }
        if (!result.hasNext || !result.nextCursor) break;
        cursor = result.nextCursor;
      }

      return posts;
    },
  });
}
