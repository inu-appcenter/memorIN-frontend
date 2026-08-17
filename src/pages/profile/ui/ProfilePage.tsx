import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints, type Device } from '@/shared/lib/useBreakpoints';
import { columnsFor } from '@/shared/lib/gridColumns';
import { showNotReady } from '@/shared/lib/showNotReady';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { useMyProfile } from '@/entities/session/model/useMyProfile';
import { useLogout } from '@/features/auth/model/useLogout';
import { useFeedQuery, PostThumbnail, type PostSummary } from '@/entities/post';
import { useFriendsQuery } from '@/entities/user';
import { PostDetailModal } from '@/widgets/postDetailModal';
import BellIcon from '@/shared/assets/icons/bell.svg';
import OptionIcon from '@/shared/assets/icons/option.svg';

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
  postCountLabel: string;
  friendCount: number | undefined;
}

function ProfileHeader({
  device,
  displayName,
  username,
  postCountLabel,
  friendCount,
}: ProfileHeaderProps) {
  const router = useRouter();
  const logout = useLogout();

  // 백엔드에 유저별 받은 반응(좋아요/이모지) 총합을 내려주는 API가 없어 표시할 수 없다.
  const reactionCountLabel = '—';
  const friendCountLabel =
    friendCount !== undefined ? String(friendCount) : '—';

  const stacked = device === 'tablet' || device === 'phone';

  const EditButton = (
    <Pressable
      onPress={showNotReady}
      className={cn(
        'h-[40px] items-center justify-center rounded-md border border-border bg-page',
        stacked ? 'flex-1' : 'px-lg'
      )}
    >
      <Text className="px-lg py-md font-bold text-secondary">프로필 편집</Text>
    </Pressable>
  );

  const SocialButton = (
    <Pressable
      onPress={() => router.push('/social')}
      className={cn(
        'h-[40px] items-center justify-center rounded-md border border-border bg-page',
        stacked ? 'flex-1' : 'px-lg'
      )}
    >
      <Text className="px-lg py-md font-bold text-secondary">친구 관리</Text>
    </Pressable>
  );

  const LogoutButton = (
    <Pressable
      onPress={() => logout.mutate()}
      disabled={logout.isPending}
      className={cn(
        'h-[40px] items-center justify-center rounded-md border border-border bg-page',
        stacked ? 'flex-1' : 'px-lg',
        logout.isPending && 'opacity-50'
      )}
    >
      <Text className="px-lg py-md font-bold text-error">
        {logout.isPending ? '로그아웃 중...' : '로그아웃'}
      </Text>
    </Pressable>
  );

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

  if (device === 'desktop') {
    return (
      <View className="px-xl py-2xl">
        <View className="flex-row gap-xl">
          {Avatar}
          <View
            className="flex-1 justify-between gap-md"
            style={{ minHeight: avatarSize }}
          >
            <View className="flex-row items-center gap-lg">
              <View className="flex gap-xs">
                <Text variant="heading" className="font-bold text-primary">
                  {username}
                </Text>
                <Text className="text-muted">{displayName}</Text>
              </View>
              <View className="flex-row gap-md">
                {EditButton}
                {SocialButton}
                {LogoutButton}
              </View>
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
            <View>
              <Text variant="heading" className="font-bold text-primary">
                {username}
              </Text>
              <Text className="text-muted">{displayName}</Text>
            </View>
            {StatsRow}
          </View>
        </View>
        <View className="flex-row gap-md">
          {EditButton}
          {SocialButton}
          {LogoutButton}
        </View>
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
      <View className="flex-row gap-md">
        {EditButton}
        {SocialButton}
        {LogoutButton}
      </View>
    </View>
  );
}

export function ProfilePage() {
  const router = useRouter();
  const { device } = useBreakpoints();
  const columns = columnsFor(device);
  const myId = useAuthStore((s) => s.user?.id);
  const { data: profile, isLoading } = useMyProfile();
  const friendsQuery = useFriendsQuery(myId);

  const {
    data,
    isLoading: feedLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useFeedQuery();

  const posts = data?.pages.flatMap((page) => page.items) ?? [];
  const postCountLabel = hasNextPage ? `${posts.length}+` : `${posts.length}`;
  // 게시물이 하나라도 이미 로드돼 있으면 로딩/에러 표시는 절대 띄우지 않는다.
  // (배경 리패치 중 feedLoading/isError가 잠깐 true여도 빈 padding 박스가 남는 문제 방지)
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
      <View className="flex-row items-center justify-between border-b border-border px-xl py-lg">
        <Text variant="heading">프로필</Text>
        <View className="flex-row items-center gap-lg">
          {/* 알림 */}
          {device === 'phone' && (
            <Pressable onPress={showNotReady} hitSlop={8}>
              <BellIcon width={20} height={22} color={COLORS.brand} />
            </Pressable>
          )}
          {/* 설정 — 폰에서의 진입점 */}
          <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
            <OptionIcon width={22} height={22} color={COLORS.tertiary} />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View className="items-center py-3xl">
          <ActivityIndicator color={COLORS.brand} />
        </View>
      ) : (
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
                    displayName={profile?.displayName ?? ''}
                    username={profile?.username ?? ''}
                    postCountLabel={postCountLabel}
                    friendCount={
                      friendsQuery.isLoading
                        ? undefined
                        : friendsQuery.friends.length
                    }
                  />
                  <View className="border-t border-border px-xl py-2xl">
                    <Text className="font-bold text-primary">내 기록</Text>
                  </View>
                  {feedLoading && hasNoPosts && (
                    <View className="items-center py-xl">
                      <ActivityIndicator color={COLORS.brand} />
                    </View>
                  )}
                  {isError && hasNoPosts && (
                    <View className="items-center py-xl">
                      <Text className="text-error">
                        {(error as Error).message}
                      </Text>
                    </View>
                  )}
                  {!feedLoading && !isError && hasNoPosts && (
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
