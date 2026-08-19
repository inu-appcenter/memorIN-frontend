import { useCallback, useMemo, useState, useRef } from 'react';
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
import {
  PostCard,
  useFeedQuery,
  useFriendFeedQuery,
  type PostSummary,
} from '@/entities/post';
import { RightPanel, FeedCommentPanel } from '@/widgets/feedRightPanel';
import { showNotReady } from '@/shared/lib/showNotReady';
import SearchIcon from '@/shared/assets/icons/search.svg';
import BellIcon from '@/shared/assets/icons/bell.svg';
import { useTranslation } from 'react-i18next';

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'recommended' | 'following'>(
    'following'
  );
  const isFollowingTab = activeTab === 'following';

  const friendFeed = useFriendFeedQuery();
  const myFeed = useFeedQuery();

  const friendPosts = useMemo(
    () => friendFeed.data?.pages.flatMap((page) => page.items) ?? [],
    [friendFeed.data]
  );
  const myPosts = useMemo(
    () => myFeed.data?.pages.flatMap((page) => page.items) ?? [],
    [myFeed.data]
  );

  const myHasNextPage = myFeed.hasNextPage;
  const friendHasNextPage = friendFeed.hasNextPage;

  const posts = useMemo(() => {
    if (!isFollowingTab) return [];

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
  }, [isFollowingTab, myPosts, friendPosts, myHasNextPage, friendHasNextPage]);

  const isLoading = friendFeed.isLoading || myFeed.isLoading;
  const isError = friendFeed.isError || myFeed.isError;
  const isFetchingNextPage =
    friendFeed.isFetchingNextPage || myFeed.isFetchingNextPage;

  const refetch = useCallback(() => {
    friendFeed.refetch();
    myFeed.refetch();
  }, [friendFeed, myFeed]);

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
    if (!isFollowingTab) return;
    if (friendFeed.hasNextPage && !friendFeed.isFetchingNextPage) {
      friendFeed.fetchNextPage();
    }
    if (myFeed.hasNextPage && !myFeed.isFetchingNextPage) {
      myFeed.fetchNextPage();
    }
  }, [isFollowingTab, friendFeed, myFeed]);

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
  const { t } = useTranslation();

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
            active={activeTab === 'recommended'}
            onPress={() => setActiveTab('recommended')}
            device={device}
          />
          <FeedTab
            label={t('feed.tabFollowing')}
            active={isFollowingTab}
            onPress={() => setActiveTab('following')}
            device={device}
          />
        </View>
        <StoryRail />
        <View className="flex-1">
          {!isFollowingTab ? (
            <View className="items-center py-3xl">
              <Text className="text-muted">{t('feed.notReady')}</Text>
            </View>
          ) : (
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
                      {t('feed.empty')}
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
