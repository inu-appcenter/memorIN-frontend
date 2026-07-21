import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../api/authApi';
import { useSetUnauthenticated } from '@/entities/session/model/useAuthStore';

export function useLogout() {
  const queryClient = useQueryClient();
  const setUnauthenticated = useSetUnauthenticated();

  return useMutation({
    mutationFn: logout,
    // 서버 호출이 실패해도 로컬 세션은 정리돼야 하므로 onSettled 사용
    onSettled: async () => {
      // 리프레시 토큰 도입되면 여기서 tokenStorage.remove(~) 추가
      queryClient.clear(); // 이전 유저의 캐시 데이터 제거
      setUnauthenticated(); // → (main) 가드가 자동으로 /sign-in으로 보냄
    },
  });
}
