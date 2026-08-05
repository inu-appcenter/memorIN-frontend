import { Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { useMyProfile } from '@/entities/session/model/useMyProfile';
import { useLogout } from '@/features/auth/model/useLogout';

export function ProfilePage() {
  const email = useAuthStore((s) => s.user?.email);
  const { data: profile, isLoading } = useMyProfile();
  const { mutate: handleLogout, isPending } = useLogout();

  return (
    <View className="flex-1 gap-lg p-lg">
      <Text variant="heading" className="text-primary">
        {isLoading ? '불러오는 중...' : (profile?.displayName ?? '프로필')}
      </Text>
      {profile?.username && (
        <Text variant="body-small" className="text-muted">
          @{profile.username}
        </Text>
      )}
      <Text variant="body" className="text-secondary">
        {email}
      </Text>
      {profile?.bio && (
        <Text variant="body" className="text-secondary">
          {profile.bio}
        </Text>
      )}

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
