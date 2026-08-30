import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import {
  useFriendsQuery,
  useFollowRequestsQuery,
  useUnfollowUser,
  useAcceptFollow,
  useRejectFollow,
  type UserFollowSummary,
  type FollowRequestItem,
} from '@/entities/user';
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';
import SearchIcon from '@/shared/assets/icons/search.svg';
import { showNotReady } from '@/shared/lib/showNotReady';
import { useTranslation } from 'react-i18next';

const CONTENT_CLASS = 'w-full max-w-[720px] self-center';

// 섹션 제목은 두 곳(받은 요청 / 내 친구)에서 같은 모양이어야 한다.
function SectionHeading({ label }: { label: string }) {
  return (
    <Text className="mb-sm text-neutral-400" variant="label">
      {label}
    </Text>
  );
}

function FriendRow({ friend }: { friend: UserFollowSummary }) {
  const unfollowUser = useUnfollowUser();
  const { t } = useTranslation();
  return (
    <View className="w-full px-xl">
      <View
        className={cn(
          CONTENT_CLASS,
          'flex-row items-center justify-between border-b border-border py-md'
        )}
      >
        <Link href={`/user/${friend.id}`} asChild>
          <Pressable className="flex-1 flex-row items-center gap-md">
            <View className="h-[44px] w-[44px] rounded-full border border-border bg-subtle" />
            <View className="flex-1 gap-xs">
              <Text className="font-bold">{friend.displayName}</Text>
              <Text className="text-muted">@{friend.username}</Text>
            </View>
          </Pressable>
        </Link>
        <Pressable
          onPress={() => unfollowUser.mutate(friend.id)}
          disabled={unfollowUser.isPending}
          className={cn(
            'h-[32px] w-[55px] items-center justify-center rounded-full border border-neutral-100 bg-page px-md',
            unfollowUser.isPending && 'opacity-50'
          )}
        >
          <Text variant="label" className="text-neutral-400">
            {t('socialPage.remove')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// 호출부(받은 요청 섹션)가 이미 px-xl + CONTENT_CLASS로 감싸므로 여기서는
// 행 자체만 그린다. 예전처럼 래퍼를 또 두면 좌우 여백이 이중으로 적용돼
// 친구 목록보다 20px(px-xl) 안쪽으로 밀려 보인다.
function FriendRequestRow({ request }: { request: FollowRequestItem }) {
  const acceptFollow = useAcceptFollow();
  const rejectFollow = useRejectFollow();
  const { t } = useTranslation();

  // 한쪽이 처리 중이면 둘 다 막는다. 수락과 거절이 같은 관계 행을 건드리므로
  // 동시에 눌리면 나중 요청이 이미 사라진 행을 대상으로 실패한다.
  const isPending = acceptFollow.isPending || rejectFollow.isPending;

  return (
    <View className="flex-row items-center justify-between py-md">
      <Link href={`/user/${request.userId}`} asChild>
        <Pressable className="flex-1 flex-row items-center gap-md">
          <View className="h-[44px] w-[44px] rounded-full border border-border bg-subtle" />
          <View className="flex-1 gap-xs">
            <Text className="font-bold">{request.displayName}</Text>
            <Text className="text-muted">@{request.username}</Text>
          </View>
        </Pressable>
      </Link>
      <View className="flex-row items-center gap-sm">
        <Pressable
          onPress={() => rejectFollow.mutate(request.followId)}
          disabled={isPending}
          className={cn(
            'h-[32px] items-center justify-center rounded-full border border-neutral-100 bg-page px-md',
            isPending && 'opacity-50'
          )}
        >
          <Text variant="label" className="text-neutral-400">
            {t('socialPage.reject')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => acceptFollow.mutate(request.followId)}
          disabled={isPending}
          className={cn(
            'h-[32px] items-center justify-center rounded-full bg-brand px-md',
            isPending && 'opacity-50'
          )}
        >
          <Text variant="label" className="text-on-brand">
            {t('socialPage.accept')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function SocialPage() {
  const router = useRouter();
  const myId = useAuthStore((s) => s.user?.id);
  const [keyword, setKeyword] = useState('');
  const friendsQuery = useFriendsQuery(myId);
  const allFriends = friendsQuery.friends;
  const requestsQuery = useFollowRequestsQuery();
  const requests = requestsQuery.data ?? [];
  const trimmedKeyword = keyword.trim().toLowerCase();
  const filteredFriends = useMemo(() => {
    if (!trimmedKeyword) {
      return allFriends;
    }

    return allFriends.filter(
      (friend) =>
        friend.username.toLowerCase().includes(trimmedKeyword) ||
        friend.displayName.toLowerCase().includes(trimmedKeyword)
    );
  }, [allFriends, trimmedKeyword]);

  const handleEndReached = useCallback(() => {
    if (!friendsQuery.isFetchingNextPage && friendsQuery.hasNextPage) {
      friendsQuery.fetchNextPage();
    }
  }, [friendsQuery]);

  const renderItem = useCallback(
    ({ item }: { item: UserFollowSummary }) => <FriendRow friend={item} />,
    []
  );

  const keyExtractor = useCallback(
    (friend: UserFollowSummary) => friend.id,
    []
  );
  const { t } = useTranslation();
  return (
    <View className="flex-1 bg-page">
      <FlashList
        data={filteredFriends}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View className="w-full">
            {/* 상단 헤더 */}
            <View className="flex-row items-center gap-md border-b border-border px-xl py-lg">
              <Pressable
                onPress={() =>
                  router.canGoBack()
                    ? router.back()
                    : router.replace('/profile')
                }
                hitSlop={8}
              >
                <ArrowLeftIcon width={20} height={20} color={COLORS.text} />
              </Pressable>

              <Text variant="heading">{t('socialPage.title')}</Text>
            </View>

            {/* 검색 영역 */}
            <View className="w-full px-xl py-lg">
              <View
                className={cn(
                  CONTENT_CLASS,
                  'h-[40px] flex-row items-center gap-sm rounded-full bg-surface px-lg'
                )}
              >
                <Pressable onPress={showNotReady} hitSlop={8}>
                  <SearchIcon width={20} height={22} color={COLORS.textMuted} />
                </Pressable>

                <TextInput
                  value={keyword}
                  onChangeText={setKeyword}
                  placeholder={t('socialPage.searchPlaceholder')}
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  className="flex-1 text-sm text-primary"
                />
              </View>
            </View>

            {/* 받은 친구 요청 — 구분선을 내용 폭에 맞춘다. 예전에는 바깥
                w-full View에 border-b가 붙어 있어 화면 끝까지 그어졌다. */}
            {requests.length > 0 && (
              <View className="w-full px-xl pb-xl">
                <View
                  className={cn(CONTENT_CLASS, 'border-b border-border pb-lg')}
                >
                  <SectionHeading
                    label={t('socialPage.requestsHeading', {
                      count: requests.length,
                    })}
                  />
                  {requests.map((request) => (
                    <FriendRequestRow
                      key={request.followId}
                      request={request}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* 로딩 */}
            {friendsQuery.isLoading && (
              <View className="items-center py-3xl">
                <ActivityIndicator color={COLORS.brand} />
              </View>
            )}

            {/* 에러 */}
            {friendsQuery.isError && (
              <View className="items-center gap-sm py-3xl">
                <Text className="text-error">
                  {(friendsQuery.error as Error).message}
                </Text>

                <Pressable onPress={() => friendsQuery.refetch()}>
                  <Text className="font-bold text-link">{t('feed.retry')}</Text>
                </Pressable>
              </View>
            )}

            {/* 친구 목록 제목 */}
            {!friendsQuery.isLoading && !friendsQuery.isError && (
              <View className="w-full px-xl">
                <View className={CONTENT_CLASS}>
                  <SectionHeading
                    label={t('socialPage.friendsHeading', {
                      count: allFriends.length,
                    })}
                  />

                  {filteredFriends.length === 0 && (
                    <View className="items-center py-xl">
                      <Text className="text-muted">
                        {trimmedKeyword
                          ? t('socialPage.emptyResult', { keyword })
                          : t('socialPage.emptyFriends')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          friendsQuery.isFetchingNextPage ? (
            <View className="w-full items-center py-lg">
              <ActivityIndicator color={COLORS.brand} />
            </View>
          ) : null
        }
      />
    </View>
  );
}
