import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import {
  useFriendsQuery,
  useFollowRequestsQuery,
  useUserSearchQuery,
  useUnfollowUser,
  useAcceptFollow,
  useRejectFollow,
  type UserFollowSummary,
  type FollowRequestItem,
  type UserSearchResult,
} from '@/entities/user';
import { FollowButton } from '@/features/follow-button';
import BackArrowIcon from '@/shared/assets/icons/back-arrow.svg';
import SearchIcon from '@/shared/assets/icons/search.svg';
import { useTranslation } from 'react-i18next';

const CONTENT_CLASS = 'w-full max-w-[720px] self-center';

// 검색 중에는 내 친구와 그 외 사용자가 한 리스트에 섞인다.
type SocialRow =
  | { kind: 'friend'; friend: UserFollowSummary }
  | { kind: 'user'; user: UserSearchResult };

// 섹션 제목은 두 곳(받은 요청 / 목록)에서 같은 모양이어야 한다.
function SectionHeading({ label }: { label: string }) {
  return (
    <Text className="mb-sm text-neutral-400" variant="label">
      {label}
    </Text>
  );
}

// 모든 행이 같은 좌우 여백과 구분선을 쓰도록 껍데기를 공유한다.
function RowShell({ children }: { children: ReactNode }) {
  return (
    <View className="w-full px-xl">
      <View
        className={cn(
          CONTENT_CLASS,
          'flex-row items-center justify-between border-b border-border py-md'
        )}
      >
        {children}
      </View>
    </View>
  );
}

// 프로필로 이동하는 좌측 영역. 친구 · 받은 요청 · 검색 결과가 모두 같은 모양이다.
function UserIdentity({
  userId,
  displayName,
  username,
  showFriendBadge = false,
}: {
  userId: string;
  displayName: string;
  username: string;
  showFriendBadge?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Link href={`/user/${userId}`} asChild>
      <Pressable className="flex-1 flex-row items-center gap-md">
        <View className="h-[44px] w-[44px] rounded-full border border-border bg-subtle" />
        <View className="flex-1 gap-xs">
          <View className="flex-row items-center gap-sm">
            <Text className="font-bold">{displayName}</Text>
            {showFriendBadge && (
              <View className="rounded-full bg-brand-subtle px-sm py-xs">
                <Text variant="label" className="text-link">
                  {t('socialPage.friendBadge')}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-muted">@{username}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

function FriendRow({
  friend,
  showFriendBadge,
}: {
  friend: UserFollowSummary;
  showFriendBadge: boolean;
}) {
  const unfollowUser = useUnfollowUser();
  const { t } = useTranslation();

  return (
    <RowShell>
      <UserIdentity
        userId={friend.id}
        displayName={friend.displayName}
        username={friend.username}
        showFriendBadge={showFriendBadge}
      />
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
    </RowShell>
  );
}

// 검색으로만 닿을 수 있는, 아직 친구가 아닌 사용자.
// 백엔드 검색 응답에는 나와의 관계 상태가 없어서 FollowButton은 항상 'none'에서 시작한다.
function UserRow({ user }: { user: UserSearchResult }) {
  return (
    <RowShell>
      <UserIdentity
        userId={user.id}
        displayName={user.displayName}
        username={user.username}
      />
      <FollowButton targetUserId={user.id} size="small" />
    </RowShell>
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
      <UserIdentity
        userId={request.userId}
        displayName={request.displayName}
        username={request.username}
      />
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
  const trimmedKeyword = keyword.trim();
  const isSearching = trimmedKeyword.length > 0;
  const lowerKeyword = trimmedKeyword.toLowerCase();

  // 친구 목록은 이미 메모리에 있어 즉시 필터링하지만, 사용자 검색은 네트워크를
  // 타므로 입력이 멈춘 뒤에만 보낸다.
  const debouncedKeyword = useDebouncedValue(trimmedKeyword, 300);
  const userSearchQuery = useUserSearchQuery(debouncedKeyword);

  const filteredFriends = useMemo(() => {
    if (!lowerKeyword) {
      return allFriends;
    }

    return allFriends.filter(
      (friend) =>
        friend.username.toLowerCase().includes(lowerKeyword) ||
        friend.displayName.toLowerCase().includes(lowerKeyword)
    );
  }, [allFriends, lowerKeyword]);

  const friendIds = useMemo(
    () => new Set(allFriends.map((friend) => friend.id)),
    [allFriends]
  );

  // 나 자신과 이미 친구인 사람은 뺀다 — 친구는 위쪽에 따로 올라간다.
  const searchedUsers = useMemo(() => {
    const items =
      userSearchQuery.data?.pages.flatMap((page) => page.items) ?? [];
    return items.filter((user) => user.id !== myId && !friendIds.has(user.id));
  }, [userSearchQuery.data, myId, friendIds]);

  // 검색 중에는 친구를 맨 위에 올리고 그 아래로 나머지 사용자를 잇는다.
  const rows = useMemo<SocialRow[]>(() => {
    const friendRows = filteredFriends.map<SocialRow>((friend) => ({
      kind: 'friend',
      friend,
    }));

    if (!isSearching) {
      return friendRows;
    }

    return [
      ...friendRows,
      ...searchedUsers.map<SocialRow>((user) => ({ kind: 'user', user })),
    ];
  }, [filteredFriends, searchedUsers, isSearching]);

  // 검색 중이면 검색 결과를, 아니면 친구 목록을 이어서 불러온다.
  const handleEndReached = useCallback(() => {
    if (isSearching) {
      if (userSearchQuery.hasNextPage && !userSearchQuery.isFetchingNextPage) {
        userSearchQuery.fetchNextPage();
      }
      return;
    }

    if (friendsQuery.hasNextPage && !friendsQuery.isFetchingNextPage) {
      friendsQuery.fetchNextPage();
    }
  }, [isSearching, userSearchQuery, friendsQuery]);

  const renderItem = useCallback(
    ({ item }: { item: SocialRow }) =>
      item.kind === 'friend' ? (
        <FriendRow friend={item.friend} showFriendBadge={isSearching} />
      ) : (
        <UserRow user={item.user} />
      ),
    [isSearching]
  );

  const keyExtractor = useCallback(
    (row: SocialRow) =>
      row.kind === 'friend' ? `friend:${row.friend.id}` : `user:${row.user.id}`,
    []
  );

  const isListLoading = isSearching
    ? userSearchQuery.isLoading
    : friendsQuery.isLoading;
  const isFetchingMore = isSearching
    ? userSearchQuery.isFetchingNextPage
    : friendsQuery.isFetchingNextPage;

  const { t } = useTranslation();
  return (
    <View className="flex-1 bg-page">
      <FlashList
        data={rows}
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
                <BackArrowIcon width={20} height={20} color={COLORS.text} />
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
                <SearchIcon width={20} height={22} color={COLORS.textMuted} />

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

                  {requestsQuery.hasNextPage &&
                    (requestsQuery.isFetchingNextPage ? (
                      <View className="items-center py-md">
                        <ActivityIndicator color={COLORS.brand} />
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => requestsQuery.fetchNextPage()}
                        className="items-center py-md"
                      >
                        <Text variant="label" className="text-link">
                          {t('socialPage.moreRequests')}
                        </Text>
                      </Pressable>
                    ))}
                </View>
              </View>
            )}

            {/* 로딩 */}
            {isListLoading && (
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

            {isSearching && userSearchQuery.isError && (
              <View className="items-center gap-sm py-3xl">
                <Text className="text-error">
                  {(userSearchQuery.error as Error).message}
                </Text>

                <Pressable onPress={() => userSearchQuery.refetch()}>
                  <Text className="font-bold text-link">{t('feed.retry')}</Text>
                </Pressable>
              </View>
            )}

            {/* 목록 제목 — 검색 중에는 친구와 그 외 사용자가 섞이므로 문구가 달라진다. */}
            {!isListLoading && !friendsQuery.isError && (
              <View className="w-full px-xl">
                <View className={CONTENT_CLASS}>
                  <SectionHeading
                    label={
                      isSearching
                        ? t('socialPage.searchResultsHeading')
                        : t('socialPage.friendsHeading', {
                            count: allFriends.length,
                          })
                    }
                  />

                  {rows.length === 0 && (
                    <View className="items-center py-xl">
                      <Text className="text-muted">
                        {isSearching
                          ? t('socialPage.emptyResult', {
                              keyword: trimmedKeyword,
                            })
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
          isFetchingMore ? (
            <View className="w-full items-center py-lg">
              <ActivityIndicator color={COLORS.brand} />
            </View>
          ) : null
        }
      />
    </View>
  );
}
