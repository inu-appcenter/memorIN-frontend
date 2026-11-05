import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentPushTarget } from '@/features/push';
import { logout } from '../api/authApi';
import { useSetUnauthenticated } from '@/entities/session/model/useAuthStore';
import {
  tokenStorage,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '@/entities/session/lib/tokenStorage';

export function useLogout() {
  const queryClient = useQueryClient();
  const setUnauthenticated = useSetUnauthenticated();

  return useMutation({
    // 토큰을 지우기 전에 이 기기의 푸시 등록을 읽어 함께 보낸다. 로그아웃
    // 뒤에는 인증이 없어 삭제 API를 따로 부를 수 없다.
    mutationFn: async () => logout(await getCurrentPushTarget()),
    // 서버 호출이 실패해도 로컬 세션은 정리돼야 하므로 onSettled 사용
    onSettled: async () => {
      await Promise.all([
        tokenStorage.remove(ACCESS_TOKEN_KEY),
        tokenStorage.remove(REFRESH_TOKEN_KEY),
      ]);
      queryClient.clear(); // 이전 유저의 캐시 데이터 제거
      setUnauthenticated(); // → (main) 가드가 자동으로 /sign-in으로 보냄
    },
  });
}