import { ActivityIndicator, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { useUserProfileQuery, useFollowListQuery } from '@/entities/user';
import { FollowButton } from '@/features/follow-button';
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';

interface UserProfilePageProps {
  userId: string;
}

export function UserProfilePage({ userId }: UserProfilePageProps) {
  const router = useRouter();
  const myId = useAuthStore((s) => s.user?.id);
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useUserProfileQuery(userId);

  const isOwnProfile = myId === userId;

  const myFollowingsQuery = useFollowListQuery(
    isOwnProfile ? undefined : myId,
    'followings'
  );
  const isAlreadyFollowing =
    myFollowingsQuery.data?.pages
      .flatMap((page) => page.items)
      .some((user) => user.id === userId) ?? false;

  return (
    <View className="flex-1 bg-page">
      <View className="flex-row items-center gap-md border-b border-border px-xl py-lg">
        <Pressable
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/feed')
          }
          hitSlop={8}
        >
          <ArrowLeftIcon width={20} height={20} color={COLORS.text} />
        </Pressable>
        <Text variant="heading">프로필</Text>
      </View>

      {isLoading && (
        <View className="items-center py-3xl">
          <ActivityIndicator color={COLORS.brand} />
        </View>
      )}

      {isError && (
        <View className="items-center gap-sm py-3xl">
          <Text className="text-error">{(error as Error).message}</Text>
          <Pressable onPress={() => refetch()}>
            <Text className="font-bold text-link">다시 시도</Text>
          </Pressable>
        </View>
      )}

      {profile && (
        <View className="items-center gap-lg px-xl py-2xl">
          <View
            className="rounded-full border border-border bg-subtle"
            style={{ width: 88, height: 88 }}
          />
          <View className="items-center gap-xs">
            <Text variant="heading" className="font-bold text-primary">
              {profile.displayName}
            </Text>
            <Text className="text-muted">@{profile.username}</Text>
          </View>
          {profile.bio && (
            <Text className="text-center text-secondary">{profile.bio}</Text>
          )}
          {!isOwnProfile && !myFollowingsQuery.isLoading && (
            <FollowButton
              targetUserId={profile.userId}
              initialState={isAlreadyFollowing ? 'following' : 'none'}
            />
          )}
        </View>
      )}
    </View>
  );
}
