import { Pressable, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text } from '@/shared/ui/text';
import { logout } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { tokenStorage } from '@/entities/session/lib/tokenStorage';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUnauthenticated = useAuthStore((s) => s.setUnauthenticated);
  const queryClient = useQueryClient();

  const { mutate: handleLogout, isPending } = useMutation({
    mutationFn: logout,
    // 서버 호출이 실패해도 로컬 세션은 정리돼야 하므로 onSettled 사용
    onSettled: async () => {
      await tokenStorage.remove('refreshToken');
      queryClient.clear(); // 이전 유저의 캐시 데이터 제거
      setUnauthenticated(); // → (main) 가드가 자동으로 /sign-in으로 보냄
    },
  });

  return (
    <View className="flex-1 gap-lg p-lg">
      <Text variant="heading" className="text-primary">
        {user?.nickname ?? '프로필'}
      </Text>
      <Text variant="body" className="text-secondary">
        {user?.email}
      </Text>

      <Pressable
        onPress={() => handleLogout()}
        disabled={isPending}
        className="mt-3xl h-[52px] items-center justify-center rounded-md border border-strong active:bg-subtle disabled:opacity-50"
      >
        <Text variant="body" className="text-error">
          {isPending ? '로그아웃 중...' : '로그아웃'}
        </Text>
      </Pressable>
    </View>
  );
}
