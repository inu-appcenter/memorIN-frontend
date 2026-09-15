import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
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
import { CalendarSection } from '@/widgets/calendarSection';
import BellIcon from '@/shared/assets/icons/bell.svg';
import OptionIcon from '@/shared/assets/icons/option.svg';
import { useTranslation } from 'react-i18next';

const PHONE_AVATAR_SIZE = 96;

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
  const { t } = useTranslation();

  // 백엔드에 유저별 받은 반응(좋아요/이모지) 총합을 내려주는 API가 없어 표시할 수 없다.
  const reactionCountLabel = '—';
  const friendCountLabel =
    friendCount !== undefined ? String(friendCount) : '—';

  const stacked = device === 'tablet';

  const EditButton = (
    <Pressable
      onPress={showNotReady}
      className={cn(
        'h-[40px] items-center justify-center rounded-md border border-border bg-page',
        stacked ? 'flex-1' : 'px-lg'
      )}
    >
      <Text className="px-lg py-md font-bold text-secondary">
        {t('profile.edit')}
      </Text>
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
      <Text className="px-lg py-md font-bold text-secondary">
        {t('profile.manageFriends')}
      </Text>
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
      <Text className="px-lg py-md font-bold text-secondary">
        {logout.isPending ? t('profile.loggingOut') : t('profile.logout')}
      </Text>
    </Pressable>
  );

  const avatarSize = device === 'desktop' ? 88 : 68;
  const Avatar = (
    <View
      className="rounded-full border border-border bg-subtle"
      style={{ width: avatarSize, height: avatarSize }}
    />
  );

  const StatsRow = (
    <View className="flex-row gap-3xl">
      <StatBlock label={t('profile.statRecords')} value={postCountLabel} />
      <StatBlock label={t('profile.statFriends')} value={friendCountLabel} />
      <StatBlock
        label={t('profile.statReactions')}
        value={reactionCountLabel}
      />
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

  // tablet
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

// 폰 시안 — 아바타 옆에 아이디·이름·소속, 그 아래 기록·친구 수가 한 줄로 붙는다.
// 수정·친구 관리·로그아웃 버튼은 시안에 없고 설정으로 들어간다.
function PhoneProfileSummary({
  username,
  displayName,
  bio,
  postCountLabel,
  friendCountLabel,
}: {
  username: string;
  displayName: string;
  bio: string | null;
  postCountLabel: string;
  friendCountLabel: string;
}) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-xl px-lg py-xl">
      <View
        className="rounded-full border border-border bg-subtle"
        style={{ width: PHONE_AVATAR_SIZE, height: PHONE_AVATAR_SIZE }}
      />
      <View className="flex-1 gap-sm">
        <Text variant="title" className="font-bold text-primary">
          {username}
        </Text>
        <View className="flex-row items-baseline gap-sm">
          <Text className="text-secondary">{displayName}</Text>
          {/* 시안의 '디자인학부 23' 자리. 백엔드에 학과·학번 필드가 없어 bio를 쓴다. */}
          {bio ? (
            <Text variant="label" className="text-muted">
              {bio}
            </Text>
          ) : null}
        </View>
        <View className="flex-row gap-xl">
          <Text className="font-bold text-primary">
            {t('profile.statRecords')} {postCountLabel}
          </Text>
          <Text className="font-bold text-primary">
            {t('profile.statFriends')} {friendCountLabel}
          </Text>
        </View>
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
  const { t } = useTranslation();

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
  const friendCountLabel = friendsQuery.isLoading
    ? '—'
    : String(friendsQuery.friends.length);

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

  const Header = (
    <View className="flex-row items-center justify-between border-b border-border px-xl py-lg">
      <Text variant="heading">{t('profile.title')}</Text>
      <View className="flex-row items-center gap-lg">
        {device === 'phone' && (
          <Pressable onPress={() => router.push('/notifications')} hitSlop={8}>
            <BellIcon width={20} height={22} color={COLORS.text} />
          </Pressable>
        )}
        {/* 설정 — 폰에서의 진입점 */}
        <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
          <OptionIcon width={22} height={22} color={COLORS.text} />
        </Pressable>
      </View>
    </View>
  );

  if (device === 'phone') {
    return (
      <View className="flex-1 bg-page">
        {Header}
        {isLoading ? (
          <View className="items-center py-3xl">
            <ActivityIndicator color={COLORS.brand} />
          </View>
        ) : (
          <ScrollView className="flex-1">
            <PhoneProfileSummary
              username={profile?.username ?? ''}
              displayName={profile?.displayName ?? ''}
              bio={profile?.bio ?? null}
              postCountLabel={postCountLabel}
              friendCountLabel={friendCountLabel}
            />
            <View className="border-t border-border">
              <CalendarSection />
            </View>
          </ScrollView>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-page">
      {Header}

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
                    <Text className="font-bold text-primary">
                      {t('profile.myRecords')}
                    </Text>
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
                        {t('profile.emptyRecords')}
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
