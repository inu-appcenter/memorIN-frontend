import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import {
  useNotifications,
  useReadNotification,
  type NotificationItem,
  type NotificationType,
} from '@/entities/notification';
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';

const CONTENT_CLASS = 'w-full max-w-[720px] self-center';

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;

const SUFFIX_KEY_BY_TYPE = {
  FOLLOW_REQUEST: 'notification.followRequest',
  FOLLOW_ACCEPTED: 'notification.followAccepted',
  COMMENT: 'notification.comment',
  LIKE: 'notification.like',
} as const satisfies Record<NotificationType, string>;

type GroupKey = 'today' | 'yesterday' | 'week' | 'earlier';

const GROUP_ORDER: GroupKey[] = ['today', 'yesterday', 'week', 'earlier'];

const GROUP_LABEL_KEY = {
  today: 'notification.groupToday',
  yesterday: 'notification.groupYesterday',
  week: 'notification.groupWeek',
  earlier: 'notification.groupEarlier',
} as const satisfies Record<GroupKey, string>;

type ListRow =
  | { kind: 'header'; key: string; group: GroupKey }
  | { kind: 'item'; key: string; notification: NotificationItem };

// 목록 안에서의 이동. 푸시 알림 클릭은 서비스워커/PushProvider가 따로 처리하며,
// 그쪽은 이 화면 자체를 목적지로 삼는다.
function routeOf(notification: NotificationItem): string {
  switch (notification.type) {
    case 'FOLLOW_REQUEST':
    case 'FOLLOW_ACCEPTED':
      return '/social';
    case 'COMMENT':
    case 'LIKE':
      return notification.referenceId
        ? `/post/${notification.referenceId}`
        : '/feed';
  }
}

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

function groupOf(createdAt: string): GroupKey {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return 'earlier';

  const diffDays = Math.round(
    (startOfDay(new Date()) - startOfDay(created)) / MS_PER_DAY
  );

  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays <= 7) return 'week';
  return 'earlier';
}

function NotificationRow({
  notification,
  onPress,
}: {
  notification: NotificationItem;
  onPress: (notification: NotificationItem) => void;
}) {
  const { t } = useTranslation();

  const actorLabel =
    notification.actorDisplayName ??
    notification.actorUsername ??
    t('comment.unknownAuthor');

  const suffixKey = SUFFIX_KEY_BY_TYPE[notification.type];

  const relativeTime = useMemo(() => {
    const created = new Date(notification.createdAt).getTime();
    if (Number.isNaN(created)) return '';

    const diffMs = Math.max(Date.now() - created, 0);
    const minutes = Math.floor(diffMs / MS_PER_MINUTE);
    if (minutes < 1) return t('notification.timeJustNow');
    if (minutes < 60)
      return t('notification.timeMinutesAgo', { count: minutes });

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('notification.timeHoursAgo', { count: hours });

    return t('notification.timeDaysAgo', { count: Math.floor(hours / 24) });
  }, [notification.createdAt, t]);

  return (
    <Pressable
      onPress={() => onPress(notification)}
      className="w-full px-xl active:opacity-70"
    >
      <View className={cn(CONTENT_CLASS, 'flex-row items-start gap-md py-md')}>
        <View className="h-[40px] w-[40px] rounded-full border border-border bg-subtle" />
        <View className="flex-1 gap-xs">
          <Text
            className={notification.read ? 'text-secondary' : 'text-primary'}
          >
            <Text className="font-bold text-primary">{actorLabel}</Text>
            {suffixKey ? t(suffixKey) : ` ${notification.message}`}
          </Text>
        </View>
        <Text variant="label" className="text-muted">
          {relativeTime}
        </Text>
      </View>
    </Pressable>
  );
}

export function NotificationsPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useNotifications();
  const readNotification = useReadNotification();

  const rows = useMemo<ListRow[]>(() => {
    const items = data?.pages.flatMap((page) => page.items) ?? [];
    const buckets = new Map<GroupKey, NotificationItem[]>();

    for (const item of items) {
      const group = groupOf(item.createdAt);
      const bucket = buckets.get(group);
      if (bucket) bucket.push(item);
      else buckets.set(group, [item]);
    }

    const result: ListRow[] = [];
    for (const group of GROUP_ORDER) {
      const bucket = buckets.get(group);
      if (!bucket?.length) continue;

      result.push({ kind: 'header', key: `header-${group}`, group });
      for (const notification of bucket) {
        result.push({ kind: 'item', key: notification.id, notification });
      }
    }
    return result;
  }, [data]);

  const handlePressItem = useCallback(
    (notification: NotificationItem) => {
      if (!notification.read) {
        readNotification.mutate(notification.id);
      }
      router.navigate(routeOf(notification));
    },
    [readNotification, router]
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: ListRow }) => {
      if (item.kind === 'header') {
        return (
          <View className="w-full px-xl pb-sm pt-lg">
            <View className={CONTENT_CLASS}>
              <Text variant="label" className="text-muted">
                {t(GROUP_LABEL_KEY[item.group])}
              </Text>
            </View>
          </View>
        );
      }

      return (
        <NotificationRow
          notification={item.notification}
          onPress={handlePressItem}
        />
      );
    },
    [handlePressItem, t]
  );

  const keyExtractor = useCallback((row: ListRow) => row.key, []);

  return (
    <View className="flex-1 bg-page">
      <View className="flex-row items-center gap-md border-b border-border px-xl py-lg">
        <Pressable
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/feed')
          }
          hitSlop={8}
        >
          <ArrowLeftIcon width={20} height={20} color={COLORS.text} />
        </Pressable>
        <Text variant="heading">{t('notification.title')}</Text>
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

      {!isLoading && !isError && rows.length === 0 && (
        <View className="items-center py-3xl">
          <Text className="text-muted">{t('notification.empty')}</Text>
        </View>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <FlashList
          data={rows}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
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
  );
}
