import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '../api/userApi';
import { useAuthStatus } from './useAuthStore';

export function useMyProfile() {
  const status = useAuthStatus();
  return useQuery({
    queryKey: ['me', 'profile'],
    queryFn: getMyProfile,
    enabled: status === 'authenticated',
    staleTime: 5 * 60 * 1000,
  });
}
