import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { signup } from '../api/authApi';

export function useSignUp() {
  const router = useRouter();

  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
      // 1. 가입 즉시 자동 로그인
      // router.replace('/feed');
      // 2. 가입 즉시 로그인 페이지로 리다이렉팅
      router.replace('/sign-in');
    },
  });
}
