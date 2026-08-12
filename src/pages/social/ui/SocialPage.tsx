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
  type UserFollowSummary,
  type FollowRequestItem,
} from '@/entities/user';
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';

function FriendRow({ friend }: { friend: UserFollowSummary }) {
  const unfollowUser = useUnfollowUser();

  return (
    <View className="flex-row items-center justify-between py-md">
      <Link href={`/user/${friend.id}`} asChild>
        <Pressable className="flex-1 flex-row items-center gap-md">
          <View className="h-[44px] w-[44px] rounded-full border border-border bg-subtle" />
          <View className="flex-1">
            <Text className="font-bold">{friend.displayName}</Text>
            <Text className="text-muted">@{friend.username}</Text>
          </View>
        </Pressable>
      </Link>
      <Pressable
        onPress={() => unfollowUser.mutate(friend.id)}
        disabled={unfollowUser.isPending}
        className={cn(
          'h-[30px] items-center justify-center rounded-full border border-border bg-page px-md',
          unfollowUser.isPending && 'opacity-50'
        )}
      >
        <Text variant="label" className="text-secondary">
          삭제
        </Text>
      </Pressable>
    </View>
  );
}

function FriendRequestRow({ request }: { request: FollowRequestItem }) {
  const acceptFollow = useAcceptFollow();

  return (
    <View className="flex-row items-center justify-between py-md">
      <Link href={`/user/${request.userId}`} asChild>
        <Pressable className="flex-1 flex-row items-center gap-md">
          <View className="h-[44px] w-[44px] rounded-full border border-border bg-subtle" />
          <View className="flex-1">
            <Text className="font-bold">{request.displayName}</Text>
            <Text className="text-muted">@{request.username}</Text>
          </View>
        </Pressable>
      </Link>
      <Pressable
        onPress={() => acceptFollow.mutate(request.followId)}
        disabled={acceptFollow.isPending}
        className={cn(
          'h-[30px] items-center justify-center rounded-full bg-brand px-md',
          acceptFollow.isPending && 'opacity-50'
        )}
      >
        <Text variant="label" className="text-on-brand">
          수락
        </Text>
      </Pressable>
    </View>
  );
}

export function SocialPage() {
  const router = useRouter();
  const myId = useAuthStore((s) => s.user?.id);
  const [keyword, setKeyword] = useState('');

  // "친구" = 맞팔로우(교집합). useFriendsQuery 참고.
  const friendsQuery = useFriendsQuery(myId);
  const allFriends = friendsQuery.friends;

  const requestsQuery = useFollowRequestsQuery();
  const requests = requestsQuery.data ?? [];

  // 검색 API 호출 없이, 이미 불러온(스크롤로 로드된 페이지까지) 내 친구 목록만
  // 클라이언트에서 필터링한다 (설계상 "아이디로 친구 검색"은 전체 유저 검색이 아니라
  // 내 친구 목록 내 검색).
  const trimmedKeyword = keyword.trim().toLowerCase();
  const filteredFriends = useMemo(() => {
    if (!trimmedKeyword) return allFriends;
    return allFriends.filter(
      (friend) =>
        friend.username.toLowerCase().includes(trimmedKeyword) ||
        friend.displayName.toLowerCase().includes(trimmedKeyword)
    );
  }, [allFriends, trimmedKeyword]);

  const handleEndReached = useCallback(() => {
    friendsQuery.fetchNextPage();
  }, [friendsQuery]);

  const renderItem = useCallback(
    ({ item }: { item: UserFollowSummary }) => <FriendRow friend={item} />,
    []
  );

  const keyExtractor = useCallback(
    (friend: UserFollowSummary) => friend.id,
    []
  );

  return (
    <View className="flex-1 bg-page">
      <FlashList
        data={filteredFriends}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
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
              <Text variant="heading">친구 관리</Text>
            </View>

            <View className="px-xl py-lg">
              <View className="h-[44px] flex-row items-center gap-sm rounded-md bg-surface px-lg">
                <Text className="text-muted">⌕</Text>
                <TextInput
                  value={keyword}
                  onChangeText={setKeyword}
                  placeholder="아이디로 친구 검색"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  className="flex-1 text-primary"
                />
              </View>
            </View>

            {requests.length > 0 && (
              <View className="border-b border-border px-xl pb-lg">
                <Text className="mb-sm font-bold text-secondary">
                  받은 친구 요청 {requests.length}
                </Text>
                {requests.map((request) => (
                  <FriendRequestRow key={request.followId} request={request} />
                ))}
              </View>
            )}

            {friendsQuery.isLoading && (
              <View className="items-center py-3xl">
                <ActivityIndicator color={COLORS.brand} />
              </View>
            )}

            {friendsQuery.isError && (
              <View className="items-center gap-sm py-3xl">
                <Text className="text-error">
                  {(friendsQuery.error as Error).message}
                </Text>
                <Pressable onPress={() => friendsQuery.refetch()}>
                  <Text className="font-bold text-link">다시 시도</Text>
                </Pressable>
              </View>
            )}

            {!friendsQuery.isLoading && !friendsQuery.isError && (
              <View className="px-xl">
                <Text className="mb-sm font-bold text-secondary">
                  내 친구 {allFriends.length}
                </Text>

                {filteredFriends.length === 0 && (
                  <View className="items-center py-xl">
                    <Text className="text-muted">
                      {trimmedKeyword
                        ? `'${keyword}'에 대한 검색 결과가 없어요`
                        : '아직 친구가 없어요'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        }
        ListFooterComponent={
          friendsQuery.isFetchingNextPage ? (
            <View className="items-center py-lg">
              <ActivityIndicator color={COLORS.brand} />
            </View>
          ) : null
        }
      />
    </View>
  );
}
