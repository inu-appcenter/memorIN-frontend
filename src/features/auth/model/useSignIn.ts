import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import { login } from '../api/authApi';
import { useSetAuthenticated } from '@/entities/session/model/useAuthStore';
import type { SignInInput } from './authSchema';

export function useSignIn() {
  const router = useRouter();
  const setAuthenticated = useSetAuthenticated();

  return useMutation({
    mutationFn: login,
    onSuccess: (data, variables: SignInInput) => {
      const { sub: userId } = jwtDecode<{ sub: string }>(data.accessToken);
      setAuthenticated(data.accessToken, {
        id: userId,
        email: variables.email,
        nickname: '',
      });
      router.replace('/feed');
    },
  });
}
