import { useCallback, useMemo, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { cn } from '@/shared/lib/utils';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { StoryRail } from '@/widgets/storyRail';
import {
  PostCard,
  useFeedQuery,
  useFriendFeedQuery,
  useRecommendedFeedQuery,
  type PostSummary,
} from '@/entities/post';
import { RightPanel, FeedCommentPanel } from '@/widgets/feedRightPanel';
import { showNotReady } from '@/shared/lib/showNotReady';
import SearchIcon from '@/shared/assets/icons/search.svg';
import BellIcon from '@/shared/assets/icons/bell.svg';

// 이만큼 내려가면 최상단 이동 버튼을 띄운다
const SCROLL_TOP_BUTTON_THRESHOLD_PX = 600;

type FeedTabKey = 'recommended' | 'following';

function FeedTab({
  label,
  active,
  onPress,
  device,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  device: 'desktop' | 'tablet' | 'phone';
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

// 백엔드는 내 피드/친구 피드를 모두 `ORDER BY recorded_date DESC, id DESC`로 정렬해
// 내려준다. postId는 UUIDv7이라 앞 48비트가 생성 시각(ms)이고 문자열 비교가 그대로
// 생성순 비교가 된다. timeslot(AM/PM)은 정렬에 쓰지 않는다.
function compareFeedOrder(a: PostSummary, b: PostSummary): number {
  if (a.recordedDate !== b.recordedDate) {
    return a.recordedDate < b.recordedDate ? 1 : -1;
  }
  if (a.postId === b.postId) return 0;
  return a.postId < b.postId ? 1 : -1;
}

export function FeedPage() {
  const { device } = useBreakpoints();
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FeedTabKey>('following');
  const isFollowingTab = activeTab === 'following';

  const friendFeed = useFriendFeedQuery();
  const myFeed = useFeedQuery();
  // 추천 탭 — 탐색 탭 그리드와 같은 쿼리 키를 써서 요청이 한 번만 나간다.
  const recommendedFeed = useRecommendedFeedQuery();

  const friendPosts = useMemo(
    () => friendFeed.data?.pages.flatMap((page) => page.items) ?? [],
    [friendFeed.data]
  );
  const myPosts = useMemo(
    () => myFeed.data?.pages.flatMap((page) => page.items) ?? [],
    [myFeed.data]
  );
  const recommendedPosts = useMemo(
    () => recommendedFeed.data?.pages.flatMap((page) => page.items) ?? [],
    [recommendedFeed.data]
  );

  const myHasNextPage = myFeed.hasNextPage;
  const friendHasNextPage = friendFeed.hasNextPage;

  // 팔로잉 탭은 내 기록과 친구 기록을 합쳐 보여준다. 두 목록의 페이징이 따로
  // 진행되므로, 아직 안 불러온 구간이 중간에 비어 보이지 않도록 두 목록이
  // 공통으로 채워진 지점까지만 잘라낸다.
  const followingPosts = useMemo(() => {
    const merged = [...myPosts, ...friendPosts].sort(compareFeedOrder);

    const openTails: PostSummary[] = [];
    if (myHasNextPage && myPosts.length > 0) {
      openTails.push(myPosts[myPosts.length - 1]);
    }
    if (friendHasNextPage && friendPosts.length > 0) {
      openTails.push(friendPosts[friendPosts.length - 1]);
    }
    if (openTails.length === 0) return merged;

    const boundary = openTails.sort(compareFeedOrder)[0];
    return merged.filter((post) => compareFeedOrder(post, boundary) <= 0);
  }, [myPosts, friendPosts, myHasNextPage, friendHasNextPage]);

  const posts = isFollowingTab ? followingPosts : recommendedPosts;

  const isLoading = isFollowingTab
    ? friendFeed.isLoading || myFeed.isLoading
    : recommendedFeed.isLoading;
  const isError = isFollowingTab
    ? friendFeed.isError || myFeed.isError
    : recommendedFeed.isError;
  const isFetchingNextPage = isFollowingTab
    ? friendFeed.isFetchingNextPage || myFeed.isFetchingNextPage
    : recommendedFeed.isFetchingNextPage;

  const refetch = useCallback(() => {
    if (isFollowingTab) {
      friendFeed.refetch();
      myFeed.refetch();
      return;
    }
    recommendedFeed.refetch();
  }, [isFollowingTab, friendFeed, myFeed, recommendedFeed]);

  const [visiblePostIds, setVisiblePostIds] = useState<Set<string>>(new Set());
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
    if (!isFollowingTab) {
      if (recommendedFeed.hasNextPage && !recommendedFeed.isFetchingNextPage) {
        recommendedFeed.fetchNextPage();
      }
      return;
    }
    if (friendFeed.hasNextPage && !friendFeed.isFetchingNextPage) {
      friendFeed.fetchNextPage();
    }
    if (myFeed.hasNextPage && !myFeed.isFetchingNextPage) {
      myFeed.fetchNextPage();
    }
  }, [isFollowingTab, friendFeed, myFeed, recommendedFeed]);

  const renderItem = useCallback(
    ({ item }: { item: PostSummary }) => (
      <View className="mx-auto w-full px-lg">
        <PostCard
          post={item}
          isVisible={visiblePostIds.has(item.postId)}
          isCommentsActive={activeCommentsPostId === item.postId}
          onOpenComments={handleOpenComments}
          onCloseComments={() => setActiveCommentsPostId(null)}
        />
      </View>
    ),
    [visiblePostIds, handleOpenComments, activeCommentsPostId]
  );

  const keyExtractor = useCallback((post: PostSummary) => post.postId, []);

  const listRef = useRef<FlashListRef<PostSummary>>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 탭 전환 시 리스트에 데이터만 갈아끼우면, 스크롤 위치가 남는 것은 물론
  // 재활용된 셀이 이전 탭의 카드를 그대로 들고 있는 경우가 생긴다
  // (추천 탭에 "친구공개" 게시물이 보이던 원인). 아래 FlashList의 key로
  // 탭마다 리스트를 새로 마운트해 그 두 가지를 함께 없앤다.
  //
  // setActiveTab과 같은 턴에 scrollToOffset을 부르는 방식은 그 시점의 리스트가
  // 아직 이전 데이터를 들고 있어 먹히지 않는다.
  const handleSelectTab = useCallback((tab: FeedTabKey) => {
    setActiveTab(tab);
    setShowScrollTop(false);
    setVisiblePostIds(new Set());
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setShowScrollTop(
        event.nativeEvent.contentOffset.y > SCROLL_TOP_BUTTON_THRESHOLD_PX
      );
    },
    []
  );

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  return (
    <View className="flex-1 flex-row bg-page">
      <View className="flex-1">
        {device !== 'desktop' && (
          <View className="flex-row items-center justify-between px-lg py-md">
            <Text variant="heading">{t('feed.title')}</Text>
            <View className="flex-row items-center gap-lg">
              <Pressable onPress={() => router.navigate('/search')} hitSlop={8}>
                <SearchIcon width={22} height={22} />
              </Pressable>
              <Pressable onPress={showNotReady} hitSlop={8}>
                <BellIcon width={20} height={22} />
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
            label={t('feed.tabRecommended')}
            active={!isFollowingTab}
            onPress={() => handleSelectTab('recommended')}
            device={device}
          />
          <FeedTab
            label={t('feed.tabFollowing')}
            active={isFollowingTab}
            onPress={() => handleSelectTab('following')}
            device={device}
          />
        </View>
        <StoryRail />
        <View className="flex-1">
          <FlashList
            key={activeTab}
            ref={listRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
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
                    {t('comment.loading')}
                  </Text>
                )}
                {isError && (
                  <View className="items-center gap-sm py-xl">
                    <Text className="text-error">{t('error.feedLoad')}</Text>
                    <Pressable onPress={refetch}>
                      <Text className="font-bold text-link">
                        {t('feed.retry')}
                      </Text>
                    </Pressable>
                  </View>
                )}
                {!isLoading && !isError && posts.length === 0 && (
                  <Text className="py-xl text-center text-muted">
                    {isFollowingTab
                      ? t('feed.empty')
                      : t('feed.emptyRecommended')}
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

          {/* 스크롤을 충분히 내렸을 때만 뜨는 최상단 이동 버튼 */}
          {showScrollTop && (
            <Pressable
              onPress={scrollToTop}
              className="absolute bottom-xl right-xl h-[44px] w-[44px] items-center justify-center rounded-full border border-border bg-page shadow-modal active:opacity-70"
            >
              <Text className="text-[20px] leading-[20px] text-secondary">
                ↑
              </Text>
            </Pressable>
          )}
        </View>
      </View>
      {activeCommentsPostId && device === 'desktop' ? (
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
