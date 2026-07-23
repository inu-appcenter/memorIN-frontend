import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  View,
  type ViewToken,
} from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { cn } from '@/shared/lib/utils';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { StoryRail } from '@/widgets/storyRail';
import { PostCard, useFeedQuery, type PostSummary } from '@/entities/post';
import { RightPanel } from '@/widgets/feedRightPanel';
import SearchIcon from '@/shared/assets/icons/search.svg';
import BellIcon from '@/shared/assets/icons/example_bell.svg';

// 탭 1개를 그리는 작은 프레젠테이셔널 컴포넌트 (피드 페이지 전용이라 별도 파일로 안 뺌)
function FeedTab({
  label,
  active,
  onPress,
  device,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  device: 'desktop' | 'tablet' | 'mobile';
}) {
  const isDividerUnderline = device !== 'tablet';

  return (
    <Pressable className="flex-1 items-center justify-center" onPress={onPress}>
      <View
        className={cn(
          'items-center',
          isDividerUnderline ? 'h-full justify-end pb-md' : 'self-center pb-xs',
          active && 'border-b-2 border-brand'
        )}
      >
        <Text className={active ? 'font-bold' : 'text-muted'}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function FeedPage() {
  const { device } = useBreakpoints();
  // 탭 UI 상태. 백엔드에 추천 피드 API가 없어서 지금은 시각적 전환만 함
  const [activeTab, setActiveTab] = useState<'recommended' | 'following'>(
    'following'
  );
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

  // 화면 전체 휠 스크롤을 피드 리스트로 전달
  const listRef = useRef<FlashListRef<PostSummary>>(null);
  const scrollOffsetRef = useRef(0);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // 사이드바/오른쪽 패널 등 피드 리스트 바깥에 커서가 있어도 휠 스크롤이 피드에 적용되도록, 브라우저 기본 스크롤을 막고 수동으로 오프셋을 계산해 스크롤한다.
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const nextOffset = Math.max(scrollOffsetRef.current + event.deltaY, 0);
      listRef.current?.scrollToOffset({ offset: nextOffset, animated: false });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <View className="flex-1 flex-row bg-page">
      <View className="flex-1">
        {device !== 'desktop' && (
          <View className="flex-row items-center justify-between px-lg py-md">
            <Text variant="heading">피드</Text>
            <View className="flex-row items-center gap-lg">
              <Pressable hitSlop={8}>
                <SearchIcon width={22} height={22} color={COLORS.brand} />
              </Pressable>
              <Pressable hitSlop={8}>
                <BellIcon width={20} height={22} color={COLORS.brand} />
              </Pressable>
              <View className="h-[34px] w-[34px] rounded-full border border-border bg-subtle" />
            </View>
          </View>
        )}
        <View className="h-[48px] flex-row border-b border-border">
          <FeedTab
            label="추천"
            active={activeTab === 'recommended'}
            onPress={() => setActiveTab('recommended')}
            device={device}
          />
          <FeedTab
            label="팔로잉"
            active={activeTab === 'following'}
            onPress={() => setActiveTab('following')}
            device={device}
          />
        </View>
        <StoryRail />
        <View className="flex-1">
          <FlashList
            ref={listRef}
            data={posts}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
              scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            renderItem={renderItem}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            ListHeaderComponent={
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
