import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import { login } from '../api/authApi';
import { useSetAuthenticated } from '@/entities/session/model/useAuthStore';
import {
  tokenStorage,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '@/entities/session/lib/tokenStorage';
import type { SignInInput } from './authSchema';

export function useSignIn() {
  const router = useRouter();
  const setAuthenticated = useSetAuthenticated();

  return useMutation({
    mutationFn: login,
    onSuccess: async (data, variables: SignInInput) => {
      const { sub: userId } = jwtDecode<{ sub: string }>(data.accessToken);
      await Promise.all([
        tokenStorage.set(ACCESS_TOKEN_KEY, data.accessToken),
        tokenStorage.set(REFRESH_TOKEN_KEY, data.refreshToken),
      ]);
      setAuthenticated(data.accessToken, {
        id: userId,
        email: variables.email,
        nickname: '',
      });
      router.replace('/feed');
    },
  });
}
