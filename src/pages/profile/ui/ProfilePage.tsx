import { Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { useLogout } from '@/features/auth/model/useLogout';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { mutate: handleLogout, isPending } = useLogout();

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
