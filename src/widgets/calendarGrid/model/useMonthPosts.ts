import { useQuery } from '@tanstack/react-query';
import { getMyFeed, type PostSummary } from '@/entities/post/api/postsApi';

// 한 달치 기록은 최대 62건(31일 × 오전/오후)이라 한 번에 다 받아도 무리가 없다.
// 그래도 상한을 넘길 수 있으니 커서로 이어 받는다.
const PAGE_SIZE = 100;
const MAX_PAGES = 5;

// 해당 월의 1일과 말일을 yyyy-MM-dd로 만든다. month는 0-based(Date와 동일).
function toMonthRange(
  year: number,
  month: number
): { from: string; to: string } {
  const pad = (value: number) => String(value).padStart(2, '0');
  const lastDay = new Date(year, month + 1, 0).getDate();
  return {
    from: `${year}-${pad(month + 1)}-01`,
    to: `${year}-${pad(month + 1)}-${pad(lastDay)}`,
  };
}

// 이번 달에 속한 게시물 목록을 반환한다.
// 예전에는 백엔드에 범위 필터가 없어서 전체 피드를 커서로 끝까지 훑으며
// 클라이언트에서 걸러냈는데, GET /api/posts가 from/to(recorded_date 기준)를
// 지원하게 되어 서버에서 바로 좁혀 받는다.
export function useMonthPosts(year: number, month: number) {
  return useQuery({
    queryKey: ['calendar', 'month-posts', year, month],
    queryFn: async () => {
      const { from, to } = toMonthRange(year, month);
      const posts: PostSummary[] = [];
      let cursor: string | undefined;

      for (let page = 0; page < MAX_PAGES; page++) {
        const result = await getMyFeed({ cursor, size: PAGE_SIZE, from, to });
        posts.push(...result.items);
        if (!result.hasNext || !result.nextCursor) break;
        cursor = result.nextCursor;
      }

      return posts;
    },
  });
}
