import { useInfiniteQuery } from '@tanstack/react-query';
import {
  getNotifications,
  type NotificationPage,
} from '../api/notificationsApi';

const PAGE_SIZE = 20;

export function useNotifications() {
  return useInfiniteQuery<NotificationPage>({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) =>
      getNotifications({
        cursor: pageParam as string | undefined,
        size: PAGE_SIZE,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}
