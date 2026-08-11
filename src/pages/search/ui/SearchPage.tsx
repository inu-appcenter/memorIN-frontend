import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue';
import { useUserSearchQuery, type UserSearchResult } from '@/entities/user';
import { FollowButton } from '@/features/follow-button';

function UserRow({ user }: { user: UserSearchResult }) {
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
      <FollowButton targetUserId={user.id} size="small" />
    </View>
  );
}

export function SearchPage() {
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

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: UserSearchResult }) => <UserRow user={item} />,
    []
  );

  const keyExtractor = useCallback((user: UserSearchResult) => user.id, []);

  return (
    <View className="flex-1 bg-page">
      <View className="flex-row items-center gap-md border-b border-border px-lg py-lg">
        <View className="h-[44px] flex-1 flex-row items-center rounded-md bg-surface px-lg">
          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="아이디 · 이름으로 검색"
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
        <View className="flex-1 items-center justify-center px-xl">
          <Text className="text-center text-muted">
            친구의 아이디나 이름을 검색해보세요
          </Text>
        </View>
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
                &lsquo;{debouncedKeyword}&rsquo;에 대한 검색 결과가 없어요
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
    </View>
  );
}
