import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { columnsFor } from '@/shared/lib/gridColumns';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import SearchIcon from '@/shared/assets/icons/search.svg';
import {
  useUserSearchQuery,
  useFollowListQuery,
  type UserSearchResult,
} from '@/entities/user';
import {
  useExploreFeedQuery,
  PostThumbnail,
  type PostSummary,
} from '@/entities/post';
import { FollowButton } from '@/features/follow-button';
import { PostDetailModal } from '@/widgets/postDetailModal';
import { useTranslation } from 'react-i18next';

function UserRow({
  user,
  isFollowing,
  followStateKnown,
}: {
  user: UserSearchResult;
  isFollowing: boolean;
  followStateKnown: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between px-lg py-md">
      <Link href={`/user/${user.id}`} asChild>
        <Pressable className="flex-1 flex-row items-center gap-md">
          <View className="h-[44px] w-[44px] rounded-full border border-border bg-subtle" />
          <View className="flex-1">
            <Text className="font-bold">{user.displayName}</Text>
            <Text className="text-muted" numberOfLines={1}>
              @{user.username}
              {user.bio ? ` · ${user.bio}` : ''}
            </Text>
          </View>
        </Pressable>
      </Link>
      {followStateKnown && (
        <FollowButton
          targetUserId={user.id}
          size="small"
          initialState={isFollowing ? 'following' : 'none'}
        />
      )}
    </View>
  );
}

export function SearchPage() {
  const { device } = useBreakpoints();
  const columns = columnsFor(device);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword, 300);
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useUserSearchQuery(debouncedKeyword);

  const hasQuery = debouncedKeyword.trim().length > 0;
  const results = data?.pages.flatMap((page) => page.items) ?? [];

  // 검색 결과(UserSearchResponse)엔 팔로우 상태가 안 내려오기 때문에, 내
  // 팔로잉 목록을 따로 불러와 교차 확인해서 "팔로우"/"팔로잉"을 정확히 표시한다.
  // (ACCEPTED 상태만 잡을 수 있고, 내가 보낸 PENDING 요청은 여전히 구분 못 함 —
  // FollowButton 주석의 기존 한계와 동일)
  const myId = useAuthStore((s) => s.user?.id);
  const myFollowingsQuery = useFollowListQuery(myId, 'followings');
  const followingIds = useMemo(
    () =>
      new Set(
        myFollowingsQuery.data?.pages.flatMap((page) =>
          page.items.map((u) => u.id)
        ) ?? []
      ),
    [myFollowingsQuery.data]
  );
  const followStateKnown = !myFollowingsQuery.isLoading;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: UserSearchResult }) => (
      <UserRow
        user={item}
        isFollowing={followingIds.has(item.id)}
        followStateKnown={followStateKnown}
      />
    ),
    [followingIds, followStateKnown]
  );

  const keyExtractor = useCallback((user: UserSearchResult) => user.id, []);

  // 검색어가 없을 때 채우는 탐색 그리드
  const {
    data: exploreData,
    isLoading: exploreLoading,
    isError: exploreIsError,
    error: exploreError,
    hasNextPage: exploreHasNextPage,
    isFetchingNextPage: exploreIsFetchingNextPage,
    fetchNextPage: exploreFetchNextPage,
  } = useExploreFeedQuery();

  const explorePosts = exploreData?.pages.flatMap((page) => page.items) ?? [];
  const hasNoExplorePosts = explorePosts.length === 0;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleExploreEndReached = useCallback(() => {
    if (exploreHasNextPage && !exploreIsFetchingNextPage) {
      exploreFetchNextPage();
    }
  }, [exploreHasNextPage, exploreIsFetchingNextPage, exploreFetchNextPage]);

  const renderExploreItem = useCallback(
    ({ item, index }: { item: PostSummary; index: number }) => (
      <PostThumbnail post={item} onPress={() => setActiveIndex(index)} />
    ),
    []
  );

  const keyExtractorExplore = useCallback(
    (post: PostSummary) => post.postId,
    []
  );

  const { t } = useTranslation();
  return (
    <View className="flex-1 bg-page">
      <View className="flex-row items-center gap-md border-b border-border px-lg py-lg">
        <View className="h-[44px] flex-1 flex-row items-center gap-sm rounded-md bg-surface px-lg">
          <SearchIcon width={22} height={22} color={COLORS.textMuted} />
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder={t('searchPage.placeholder')}
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            className="flex-1 text-primary"
          />
        </View>
        <Link href="/social" asChild>
          <Pressable
            hitSlop={8}
            className="h-[34px] w-[34px] items-center justify-center rounded-full border border-border bg-subtle"
          />
        </Link>
      </View>

      {!hasQuery && (
        <FlashList
          data={explorePosts}
          keyExtractor={keyExtractorExplore}
          numColumns={columns}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
          onEndReached={handleExploreEndReached}
          onEndReachedThreshold={0.5}
          renderItem={renderExploreItem}
          ListEmptyComponent={
            !exploreLoading && !exploreIsError ? (
              <View className="items-center py-3xl">
                <Text className="text-center text-muted">
                  {t('searchPage.emptyFeed', { newline: '\n' })}
                </Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            <>
              {exploreLoading && hasNoExplorePosts && (
                <View className="items-center py-xl">
                  <ActivityIndicator color={COLORS.brand} />
                </View>
              )}
              {exploreIsError && hasNoExplorePosts && (
                <View className="items-center py-xl">
                  <Text className="text-error">
                    {(exploreError as Error).message}
                  </Text>
                </View>
              )}
            </>
          }
          ListFooterComponent={
            exploreIsFetchingNextPage ? (
              <View className="items-center py-lg">
                <ActivityIndicator color={COLORS.brand} />
              </View>
            ) : null
          }
        />
      )}

      {hasQuery && isLoading && (
        <View className="items-center py-3xl">
          <ActivityIndicator color={COLORS.brand} />
        </View>
      )}

      {hasQuery && isError && (
        <View className="items-center gap-sm py-3xl">
          <Text className="text-error">{(error as Error).message}</Text>
        </View>
      )}

      {hasQuery && !isLoading && !isError && (
        <FlashList
          data={results}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View className="items-center py-3xl">
              <Text className="text-muted">
                {t('searchPage.emptyResult', { keyword: debouncedKeyword })}
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="items-center py-lg">
                <ActivityIndicator color={COLORS.brand} />
              </View>
            ) : null
          }
        />
      )}

      {activeIndex !== null && (
        <PostDetailModal
          posts={explorePosts}
          startIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </View>
  );
}
