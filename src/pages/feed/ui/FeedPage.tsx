import { useCallback, useRef, useState } from 'react';
import { Pressable, View, type ViewToken } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { StoryRail } from '@/widgets/storyRail';
import { PostCard, useFeedQuery, type PostSummary } from '@/entities/post';
import { RightPanel } from '@/widgets/feedRightPanel';

export function FeedPage() {
  const { device } = useBreakpoints();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedQuery();

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  const [visiblePostIds, setVisiblePostIds] = useState<Set<string>>(new Set());
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      setVisiblePostIds(
        new Set(viewableItems.map((token) => String(token.key)))
      );
    }
  ).current;
  // 카드가 뷰포트에 80% 이상 보일 때만 동영상을 자동 재생
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: PostSummary }) => (
      <View className="mx-auto w-full px-lg">
        <PostCard post={item} isVisible={visiblePostIds.has(item.postId)} />
      </View>
    ),
    [visiblePostIds]
  );

  const keyExtractor = useCallback((post: PostSummary) => post.postId, []);

  return (
    <View className="flex-1 flex-row bg-page">
      <View className="flex-1">
        <View className="flex-row items-center justify-between border-b border-border px-lg">
          {device !== 'desktop' && (
            <View className="flex-row items-center gap-lg">
              <Text className="text-[24px]">⌕</Text>
              <Text className="text-[24px]">♧</Text>
              <View className="h-[34px] w-[34px] rounded-full border border-border bg-subtle" />
            </View>
          )}
        </View>
        <View className="h-[48px] flex-row border-b border-border">
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted">추천</Text>
          </View>
          <View className="flex-1 items-center justify-center">
            <Text className="border-b-2 border-brand font-bold">팔로잉</Text>
          </View>
        </View>
        {/* 뷰를 재활용해서 이미지/동영상이 많은 피드에서 메모리 사용량과 스크롤 프레임 드랍을 줄임 */}
        <View className="flex-1">
          <FlashList
            data={posts}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            renderItem={renderItem}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            ListHeaderComponent={
              <>
                <StoryRail />
                <View className="mx-auto w-full px-lg pt-lg">
                  {isLoading && (
                    <Text className="py-xl text-center text-muted">
                      불러오는 중...
                    </Text>
                  )}
                  {isError && (
                    <View className="items-center gap-sm py-xl">
                      <Text className="text-error">
                        {(error as Error).message}
                      </Text>
                      <Pressable onPress={() => refetch()}>
                        <Text className="font-bold text-link">다시 시도</Text>
                      </Pressable>
                    </View>
                  )}
                  {!isLoading && !isError && posts.length === 0 && (
                    <Text className="py-xl text-center text-muted">
                      아직 기록이 없어요.
                    </Text>
                  )}
                </View>
              </>
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="items-center py-lg">
                  <ActivityIndicator color={COLORS.brand} />
                </View>
              ) : (
                <View className="pb-lg" />
              )
            }
          />
        </View>
      </View>
      <RightPanel />
    </View>
  );
}
