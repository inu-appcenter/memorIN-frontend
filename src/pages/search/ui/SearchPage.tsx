import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { cn } from '@/shared/lib/utils';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { columnsFor } from '@/shared/lib/gridColumns';
import { searchHistoryStorage } from '@/shared/lib/searchHistoryStorage';
import SearchIcon from '@/shared/assets/icons/search.svg';
import FilterIcon from '@/shared/assets/icons/filter.svg';
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';
import {
  useSearchPostsQuery,
  canSortByAccuracy,
  DEFAULT_POST_SEARCH_FILTERS,
  PostThumbnail,
  type PostSearchFilters,
  type PostSummary,
  type TagType,
} from '@/entities/post';
import { TAG_LABEL_KEY } from '@/entities/post/model/postContent';
import { PostFilterSheet, SortSelect } from '@/features/post-search';
import { PostDetailModal } from '@/widgets/postDetailModal';

type Chip =
  | { kind: 'timeslot'; key: string; label: string }
  | { kind: 'tag'; key: string; label: string; tag: TagType };

export function SearchPage() {
  const { t } = useTranslation();
  const { device } = useBreakpoints();
  const columns = columnsFor(device);

  const [filters, setFilters] = useState<PostSearchFilters>(
    DEFAULT_POST_SEARCH_FILTERS
  );
  // 검색어 입력은 전용 모드에서만 받는다. 그리드 위 검색바는 그 모드로 들어가는
  // 버튼일 뿐이라 값을 직접 편집하지 않는다.
  const [isSearching, setIsSearching] = useState(false);
  const [draftKeyword, setDraftKeyword] = useState('');
  const [recentKeywords, setRecentKeywords] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    searchHistoryStorage.get().then(setRecentKeywords);
  }, []);

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useSearchPostsQuery(filters);

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const filterCount = filters.tags.length + (filters.timeslot ? 1 : 0);

  const chips = useMemo<Chip[]>(() => {
    const result: Chip[] = [];
    if (filters.timeslot) {
      result.push({
        kind: 'timeslot',
        key: 'timeslot',
        label: t(
          filters.timeslot === 'AM' ? 'post.timeslotAm' : 'post.timeslotPm'
        ),
      });
    }
    for (const tag of filters.tags) {
      result.push({
        kind: 'tag',
        key: `tag-${tag}`,
        label: t(TAG_LABEL_KEY[tag]),
        tag,
      });
    }
    return result;
  }, [filters.timeslot, filters.tags, t]);

  const removeChip = useCallback((chip: Chip) => {
    setFilters((prev) =>
      chip.kind === 'timeslot'
        ? { ...prev, timeslot: null }
        : { ...prev, tags: prev.tags.filter((tag) => tag !== chip.tag) }
    );
  }, []);

  const openSearch = useCallback(() => {
    setDraftKeyword(filters.keyword);
    setIsSearching(true);
  }, [filters.keyword]);

  const submitSearch = useCallback(async () => {
    const trimmed = draftKeyword.trim();
    setFilters((prev) => ({ ...prev, keyword: trimmed }));
    setIsSearching(false);
    if (trimmed) {
      setRecentKeywords(await searchHistoryStorage.add(trimmed));
    }
  }, [draftKeyword]);

  const pickRecent = useCallback(async (keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword }));
    setIsSearching(false);
    setRecentKeywords(await searchHistoryStorage.add(keyword));
  }, []);

  const removeRecent = useCallback(async (keyword: string) => {
    setRecentKeywords(await searchHistoryStorage.remove(keyword));
  }, []);

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

  if (isSearching) {
    return (
      <View className="flex-1 bg-page">
        <View className="flex-row items-center gap-md border-b border-border px-lg py-lg">
          <Pressable onPress={() => setIsSearching(false)} hitSlop={8}>
            <ArrowLeftIcon width={20} height={20} color={COLORS.text} />
          </Pressable>
          <View className="h-[44px] flex-1 flex-row items-center gap-sm rounded-md bg-surface px-lg">
            <TextInput
              value={draftKeyword}
              onChangeText={setDraftKeyword}
              onSubmitEditing={submitSearch}
              placeholder={t('searchPage.postPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              returnKeyType="search"
              className="flex-1 text-primary"
            />
            {draftKeyword.length > 0 && (
              <Pressable onPress={() => setDraftKeyword('')} hitSlop={8}>
                <Text className="text-muted">✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View className="gap-md p-lg">
          <Text variant="label" className="text-muted">
            {t('searchPage.recentTitle')}
          </Text>
          <View className="flex-row flex-wrap gap-sm">
            {recentKeywords.map((keyword) => (
              <View
                key={keyword}
                className="flex-row items-center gap-sm rounded-full bg-surface px-lg py-sm"
              >
                <Pressable onPress={() => pickRecent(keyword)} hitSlop={4}>
                  <Text className="text-primary">{keyword}</Text>
                </Pressable>
                <Pressable onPress={() => removeRecent(keyword)} hitSlop={8}>
                  <Text className="text-muted">✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-page">
      <View className="flex-row items-center gap-md px-lg pb-md pt-lg">
        <Pressable
          onPress={openSearch}
          className="h-[44px] flex-1 flex-row items-center gap-sm rounded-md bg-surface px-lg"
        >
          <SearchIcon width={22} height={22} color={COLORS.textMuted} />
          <Text className={filters.keyword ? 'text-primary' : 'text-muted'}>
            {filters.keyword || t('searchPage.postPlaceholder')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFilterVisible(true)}
          hitSlop={8}
          className={cn(
            'relative h-[40px] w-[40px] items-center justify-center rounded-md border',
            filterCount > 0
              ? 'border-brand bg-brand-subtle'
              : 'border-border bg-page'
          )}
        >
          <FilterIcon
            width={20}
            height={20}
            color={filterCount > 0 ? COLORS.brand : COLORS.textSecondary}
          />
          {filterCount > 0 && (
            <View className="absolute -right-[6px] -top-[6px] h-[18px] w-[18px] items-center justify-center rounded-full bg-brand">
              <Text variant="caption" className="text-on-brand">
                {filterCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {chips.length > 0 && (
        <View className="flex-row flex-wrap gap-sm px-lg pb-md">
          {chips.map((chip) => (
            <Pressable
              key={chip.key}
              onPress={() => removeChip(chip)}
              className="flex-row items-center gap-sm rounded-full bg-brand-subtle px-md py-xs"
            >
              <Text variant="label" className="text-link">
                {chip.label}
              </Text>
              <Text variant="label" className="text-link">
                ✕
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View className="flex-row items-center justify-between border-b border-border px-lg pb-md">
        <Text variant="label" className="text-muted">
          {filters.keyword
            ? t('searchPage.resultTitle', { keyword: filters.keyword })
            : ''}
        </Text>
        <SortSelect
          value={filters.sort}
          allowAccuracy={canSortByAccuracy(filters)}
          onChange={(sort) => setFilters((prev) => ({ ...prev, sort }))}
        />
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
            <Text className="font-bold text-link">{t('feed.retry')}</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !isError && (
        <FlashList
          data={posts}
          keyExtractor={keyExtractor}
          numColumns={columns}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="items-center py-3xl">
              <Text className="text-center text-muted">
                {filters.keyword
                  ? t('searchPage.emptyPostResult', {
                      keyword: filters.keyword,
                    })
                  : t('searchPage.emptyFeed', { newline: '\n' })}
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

      <PostFilterSheet
        visible={filterVisible}
        value={{ timeslot: filters.timeslot, tags: filters.tags }}
        onApply={(value) => setFilters((prev) => ({ ...prev, ...value }))}
        onClose={() => setFilterVisible(false)}
      />

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
