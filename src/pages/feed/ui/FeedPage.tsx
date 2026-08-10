import { useCallback, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  View,
  type ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { cn } from '@/shared/lib/utils';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { StoryRail } from '@/widgets/storyRail';
import { PostCard, useFeedQuery, type PostSummary } from '@/entities/post';
import { RightPanel, FeedCommentPanel } from '@/widgets/feedRightPanel';
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
  const router = useRouter();
  // 탭 UI 상태. 백엔드에 추천 피드 API가 없어서 지금은 시각적 전환만 함
  const [activeTab, setActiveTab] = useState<'recommended' | 'following'>(
    'following'
  );
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedQuery();

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  const [visiblePostIds, setVisiblePostIds] = useState<Set<string>>(new Set());
  // 데스크탑 전용: null이면 우측 패널이 친구 추천을 보여주고,
  // 값이 있으면 그 게시물의 댓글 패널로 전환된다.
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<
    string | null
  >(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      setVisiblePostIds(
        new Set(viewableItems.map((token) => String(token.key)))
      );
    }
  ).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 }).current;

  const handleOpenComments = useCallback((postId: string) => {
    setActiveCommentsPostId(postId);
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: PostSummary }) => (
      <View className="mx-auto w-full px-lg">
        <PostCard
          post={item}
          isVisible={visiblePostIds.has(item.postId)}
          onOpenComments={handleOpenComments}
        />
      </View>
    ),
    [visiblePostIds, handleOpenComments]
  );

  const keyExtractor = useCallback((post: PostSummary) => post.postId, []);

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
              <Pressable
                onPress={() => router.navigate('/profile')}
                hitSlop={8}
              >
                <View className="h-[34px] w-[34px] rounded-full border border-border bg-subtle" />
              </Pressable>
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
            data={posts}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
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
                    <Text className="text-error">피드를 불러오지 못했어요</Text>
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
      {activeCommentsPostId ? (
        <FeedCommentPanel
          postId={activeCommentsPostId}
          onClose={() => setActiveCommentsPostId(null)}
        />
      ) : (
        <RightPanel />
      )}
    </View>
  );
}
