import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints, type Device } from '@/shared/lib/useBreakpoints';
import { columnsFor } from '@/shared/lib/gridColumns';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import {
  useUserProfileQuery,
  useFollowListQuery,
  useFriendsQuery,
} from '@/entities/user';
import {
  useUserFeedQuery,
  PostThumbnail,
  type PostSummary,
} from '@/entities/post';
import { FollowButton } from '@/features/follow-button';
import { PostDetailModal } from '@/widgets/postDetailModal';
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';

interface UserProfilePageProps {
  userId: string;
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center gap-xs">
      <Text className="font-bold text-primary">{value}</Text>
      <Text className="text-muted">{label}</Text>
    </View>
  );
}

interface ProfileHeaderProps {
  device: Device;
  displayName: string;
  username: string;
  bio: string | null;
  postCountLabel: string;
  friendCount: number | undefined;
  showFollowButton: boolean;
  userId: string;
  isAlreadyFollowing: boolean;
}

function ProfileHeader({
  device,
  displayName,
  username,
  bio,
  postCountLabel,
  friendCount,
  showFollowButton,
  userId,
  isAlreadyFollowing,
}: ProfileHeaderProps) {
  // 백엔드에 유저별 받은 반응(좋아요/이모지) 총합을 내려주는 API가 없어 표시할 수 없다.
  const reactionCountLabel = '—';
  const friendCountLabel =
    friendCount !== undefined ? String(friendCount) : '—';

  const stacked = device === 'tablet' || device === 'phone';

  const FollowButtonSlot = showFollowButton ? (
    <FollowButton
      targetUserId={userId}
      initialState={isAlreadyFollowing ? 'following' : 'none'}
      className={stacked ? 'flex-1' : undefined}
    />
  ) : null;

  const avatarSize = device === 'desktop' ? 88 : device === 'tablet' ? 68 : 64;
  const Avatar = (
    <View
      className="rounded-full border border-border bg-subtle"
      style={{ width: avatarSize, height: avatarSize }}
    />
  );

  const StatsRow = (
    <View className="flex-row gap-3xl">
      <StatBlock label="기록" value={postCountLabel} />
      <StatBlock label="친구" value={friendCountLabel} />
      <StatBlock label="받은 반응" value={reactionCountLabel} />
    </View>
  );

  const NameBlock = (
    <View className="flex gap-xs">
      <Text variant="heading" className="font-bold text-primary">
        {username}
      </Text>
      <Text className="text-muted">{displayName}</Text>
      {bio && <Text className="text-secondary">{bio}</Text>}
    </View>
  );

  if (device === 'desktop') {
    // ProfilePage와 동일한 구조: 아바타 왼쪽 고정, 오른쪽 컬럼을 위(이름+버튼)/아래(통계)로 justify-between
    return (
      <View className="px-xl py-2xl">
        <View className="flex-row gap-xl">
          {Avatar}
          <View
            className="flex-1 justify-between gap-md"
            style={{ minHeight: avatarSize }}
          >
            <View className="flex-row items-center gap-lg">
              {NameBlock}
              {FollowButtonSlot}
            </View>
            {StatsRow}
          </View>
        </View>
      </View>
    );
  }

  if (device === 'tablet') {
    return (
      <View className="gap-lg px-xl py-xl">
        <View className="flex-row gap-lg">
          {Avatar}
          <View className="justify-between" style={{ minHeight: avatarSize }}>
            {NameBlock}
            {StatsRow}
          </View>
        </View>
        {FollowButtonSlot && (
          <View className="flex-row gap-md">{FollowButtonSlot}</View>
        )}
      </View>
    );
  }

  // phone
  return (
    <View className="gap-lg px-lg py-xl">
      <View className="flex-row items-center gap-lg">
        {Avatar}
        <View className="gap-xs">
          <Text variant="heading" className="font-bold text-primary">
            {username}
          </Text>
          <Text className="text-muted">{displayName}</Text>
          <Text className="text-muted">
            기록 {postCountLabel} · 친구 {friendCountLabel}
          </Text>
        </View>
      </View>
      {bio && <Text className="text-secondary">{bio}</Text>}
      {FollowButtonSlot && (
        <View className="flex-row gap-md">{FollowButtonSlot}</View>
      )}
    </View>
  );
}

export function UserProfilePage({ userId }: UserProfilePageProps) {
  const router = useRouter();
  const { device } = useBreakpoints();
  const columns = columnsFor(device);
  const myId = useAuthStore((s) => s.user?.id);
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useUserProfileQuery(userId);

  const isOwnProfile = myId === userId;

  // FollowButton은 마운트 시점의 initialState를 내부 state로 그대로 굳힌다(이후
  // props가 바뀌어도 재계산 안 함) — 그래서 이미 팔로우 중인 사람인지 미리 알아내
  // 로딩이 끝난 뒤에만 버튼을 그려야, "이미 팔로우 중인데 '팔로우'로 뜨고 누르면
  // 중복 요청 에러가 나는" 상황을 막을 수 있다.
  const myFollowingsQuery = useFollowListQuery(
    isOwnProfile ? undefined : myId,
    'followings'
  );
  const isAlreadyFollowing =
    myFollowingsQuery.data?.pages
      .flatMap((page) => page.items)
      .some((user) => user.id === userId) ?? false;

  const friendsQuery = useFriendsQuery(userId);

  const {
    data: feedData,
    isLoading: feedLoading,
    isError: feedIsError,
    error: feedError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useUserFeedQuery(userId);

  const posts = feedData?.pages.flatMap((page) => page.items) ?? [];
  const postCountLabel = hasNextPage ? `${posts.length}+` : `${posts.length}`;
  const hasNoPosts = posts.length === 0;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item, index }: { item: PostSummary; index: number }) => (
      <PostThumbnail post={item} onPress={() => setActiveIndex(index)} />
    ),
    []
  );

  const keyExtractor = useCallback((post: PostSummary) => post.postId, []);

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
        <View
          className="flex-1"
          style={device === 'desktop' ? { alignItems: 'center' } : undefined}
        >
          <View
            className="w-full flex-1"
            style={device === 'desktop' ? { maxWidth: 1080 } : undefined}
          >
            <FlashList
              data={posts}
              keyExtractor={keyExtractor}
              numColumns={columns}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              renderItem={renderItem}
              ListHeaderComponent={
                <>
                  <ProfileHeader
                    device={device}
                    displayName={profile.displayName}
                    username={profile.username}
                    bio={profile.bio}
                    postCountLabel={postCountLabel}
                    friendCount={
                      friendsQuery.isLoading
                        ? undefined
                        : friendsQuery.friends.length
                    }
                    showFollowButton={
                      !isOwnProfile && !myFollowingsQuery.isLoading
                    }
                    userId={profile.userId}
                    isAlreadyFollowing={isAlreadyFollowing}
                  />
                  <View className="border-t border-border px-xl py-2xl">
                    <Text className="font-bold text-primary">기록</Text>
                  </View>
                  {feedLoading && hasNoPosts && (
                    <View className="items-center py-xl">
                      <ActivityIndicator color={COLORS.brand} />
                    </View>
                  )}
                  {feedIsError && hasNoPosts && (
                    <View className="items-center py-xl">
                      <Text className="text-error">
                        {(feedError as Error).message}
                      </Text>
                    </View>
                  )}
                  {!feedLoading && !feedIsError && hasNoPosts && (
                    <View className="items-center py-xl">
                      <Text className="text-muted">
                        아직 올린 기록이 없어요
                      </Text>
                    </View>
                  )}
                </>
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View className="items-center py-lg">
                    <ActivityIndicator color={COLORS.brand} />
                  </View>
                ) : null
              }
            />
          </View>
        </View>
      )}

      {activeIndex !== null && (
        <PostDetailModal
          posts={posts}
          startIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </View>
  );
}
