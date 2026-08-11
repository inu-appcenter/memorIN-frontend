import { useQuery } from '@tanstack/react-query';
import { getFollowRequests } from '../api/userApi';

export function useFollowRequestsQuery() {
  return useQuery({
    queryKey: ['users', 'followRequests'],
    queryFn: getFollowRequests,
    staleTime: 30 * 1000,
  });
}
