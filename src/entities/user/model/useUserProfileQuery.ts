import { useQuery } from '@tanstack/react-query';
import { getPublicProfile } from '../api/userApi';

export function useUserProfileQuery(userId: string | undefined) {
  return useQuery({
    queryKey: ['users', userId, 'profile'],
    queryFn: () => getPublicProfile(userId as string),
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });
}
