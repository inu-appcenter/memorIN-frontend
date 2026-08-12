import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { useMyProfile } from '@/entities/session/model/useMyProfile';
import { useLogout } from '@/features/auth/model/useLogout';
import {
  useFeedQuery,
  resolveMediaUrl,
  type PostSummary,
} from '@/entities/post';
import { PostVideoCover } from '@/entities/post/ui/PostVideoCover';
import { useFriendsQuery } from '@/entities/user';
import { StoryViewer } from '@/widgets/storyViewer';
import BellIcon from '@/shared/assets/icons/example_bell.svg';

type Device = 'desktop' | 'tablet' | 'mobile';

// 그리드 컬럼 수 — 피그마 기준(데스크탑 5 / 테블릿 4 / 폰 3)
function columnsFor(device: Device) {
  if (device === 'desktop') return 5;
  if (device === 'tablet') return 4;
  return 3;
}

function showNotReady() {
  const message = '아직 준비 중인 기능이에요';
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert('안내', message);
  }
}

function PostThumbnail({
  post,
  onPress,
}: {
  post: PostSummary;
  onPress: () => void;
}) {
  const cover = post.attachments[0];
  const coverUrl = cover ? resolveMediaUrl(cover) : undefined;
  const isVideo = cover?.contentType.startsWith('video/') ?? false;

  return (
    <Pressable
      onPress={onPress}
      style={{ margin: 4 }}
      className="aspect-square flex-1 items-center justify-center overflow-hidden rounded-sm bg-subtle"
    >
      {coverUrl && isVideo ? (
        <>
          {/* isVisible=false → 재생 안 하고 첫 프레임만 정지 이미지로 사용 (DayDetailContent와 동일 패턴) */}
          <PostVideoCover
            uri={coverUrl}
            isVisible={false}
            nativeControls={false}
            style={{ height: '100%', width: '100%' }}
          />
          <View className="absolute h-[28px] w-[28px] items-center justify-center rounded-full bg-black/50">
            <Text className="text-white">▶</Text>
          </View>
        </>
      ) : coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <Text className="text-tertiary">IMG</Text>
      )}
    </Pressable>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center gap-xs">
      <Text className="font-bold text-primary">{value}</Text>
      <Text className="text-muted">{label}</Text>
    </View>
  );
}

interface ProfileHeaderProps {
  device: Device;
  displayName: string;
  username: string;
  postCountLabel: string;
  friendCount: number | undefined;
}

function ProfileHeader({
  device,
  displayName,
  username,
  postCountLabel,
  friendCount,
}: ProfileHeaderProps) {
  const router = useRouter();
  const logout = useLogout();

  // 백엔드에 유저별 받은 반응(좋아요/이모지) 총합을 내려주는 API가 없어 표시할 수 없다.
  const reactionCountLabel = '—';
  const friendCountLabel =
    friendCount !== undefined ? String(friendCount) : '—';

  const stacked = device === 'tablet' || device === 'mobile';

  const EditButton = (
    <Pressable
      onPress={showNotReady}
      className={cn(
        'h-[40px] items-center justify-center rounded-md border border-border bg-page',
        stacked ? 'flex-1' : 'px-lg'
      )}
    >
      <Text className="px-lg py-md font-bold text-secondary">프로필 편집</Text>
    </Pressable>
  );

  const SocialButton = (
    <Pressable
      onPress={() => router.push('/social')}
      className={cn(
        'h-[40px] items-center justify-center rounded-md border border-border bg-page',
        stacked ? 'flex-1' : 'px-lg'
      )}
    >
      <Text className="px-lg py-md font-bold text-secondary">친구 관리</Text>
    </Pressable>
  );

  const LogoutButton = (
    <Pressable
      onPress={() => logout.mutate()}
      disabled={logout.isPending}
      className={cn(
        'h-[40px] items-center justify-center rounded-md border border-border bg-page',
        stacked ? 'flex-1' : 'px-lg',
        logout.isPending && 'opacity-50'
      )}
    >
      <Text className="px-lg py-md font-bold text-error">
        {logout.isPending ? '로그아웃 중...' : '로그아웃'}
      </Text>
    </Pressable>
  );

  const avatarSize = device === 'desktop' ? 88 : device === 'tablet' ? 68 : 64;
  const Avatar = (
    <View
      className="rounded-full border border-border bg-subtle"
      style={{ width: avatarSize, height: avatarSize }}
    />
  );

  const StatsRow = (
    <View className="flex-row gap-3xl">
      <StatBlock label="기록" value={postCountLabel} />
      <StatBlock label="친구" value={friendCountLabel} />
      <StatBlock label="받은 반응" value={reactionCountLabel} />
    </View>
  );

  if (device === 'desktop') {
    // 아바타는 왼쪽 고정, 오른쪽 컬럼을 위(이름+버튼)/아래(통계)로 justify-between —
    // 아바타 높이만큼 두 줄이 위아래로 벌어진다
    return (
      <View className="px-xl py-2xl">
        <View className="flex-row gap-xl">
          {Avatar}
          <View
            className="flex-1 justify-between gap-md"
            style={{ minHeight: avatarSize }}
          >
            <View className="flex-row items-center gap-lg">
              <View className="flex gap-xs">
                <Text variant="heading" className="font-bold text-primary">
                  {username}
                </Text>
                <Text className="text-muted">{displayName}</Text>
              </View>
              <View className="flex-row gap-md">
                {EditButton}
                {SocialButton}
                {LogoutButton}
              </View>
            </View>
            {StatsRow}
          </View>
        </View>
      </View>
    );
  }

  if (device === 'tablet') {
    // 데스크탑과 같은 구조: 아바타 왼쪽 고정 + 오른쪽 컬럼(이름 위 / 통계 아래) —
    // 다만 버튼은 이름 옆이 아니라 그 아래 별도 줄에 전체 너비로 배치
    return (
      <View className="gap-lg px-xl py-xl">
        <View className="flex-row gap-lg">
          {Avatar}
          <View className="justify-between" style={{ minHeight: avatarSize }}>
            <View>
              <Text variant="heading" className="font-bold text-primary">
                {username}
              </Text>
              <Text className="text-muted">{displayName}</Text>
            </View>
            {StatsRow}
          </View>
        </View>
        <View className="flex-row gap-md">
          {EditButton}
          {SocialButton}
          {LogoutButton}
        </View>
      </View>
    );
  }

  // mobile
  return (
    <View className="gap-lg px-lg py-xl">
      <View className="flex-row items-center gap-lg">
        {Avatar}
        <View className="gap-xs">
          <Text variant="heading" className="font-bold text-primary">
            {username}
          </Text>
          <Text className="text-muted">{displayName}</Text>
          <Text className="text-muted">
            기록 {postCountLabel} · 친구 {friendCountLabel}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-md">
        {EditButton}
        {SocialButton}
        {LogoutButton}
      </View>
    </View>
  );
}

export function ProfilePage() {
  const { device } = useBreakpoints();
  const columns = columnsFor(device);
  const myId = useAuthStore((s) => s.user?.id);
  const { data: profile, isLoading } = useMyProfile();
  const friendsQuery = useFriendsQuery(myId);

  const {
    data,
    isLoading: feedLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useFeedQuery();

  const posts = data?.pages.flatMap((page) => page.items) ?? [];
  const postCountLabel = hasNextPage ? `${posts.length}+` : `${posts.length}`;
  // 게시물이 하나라도 이미 로드돼 있으면 로딩/에러 표시는 절대 띄우지 않는다.
  // (배경 리패치 중 feedLoading/isError가 잠깐 true여도 빈 padding 박스가 남는 문제 방지)
  const hasNoPosts = posts.length === 0;

  const [storyIndex, setStoryIndex] = useState<number | null>(null);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item, index }: { item: PostSummary; index: number }) => (
      <PostThumbnail post={item} onPress={() => setStoryIndex(index)} />
    ),
    []
  );

  const keyExtractor = useCallback((post: PostSummary) => post.postId, []);

  return (
    <View className="flex-1 bg-page">
      <View className="flex-row items-center justify-between border-b border-border px-xl py-lg">
        <Text variant="heading">프로필</Text>
        <Pressable onPress={showNotReady} hitSlop={8}>
          {device === 'mobile' ? (
            <BellIcon width={20} height={22} color={COLORS.brand} />
          ) : (
            <Text className="text-secondary">⚙</Text>
          )}
        </Pressable>
      </View>

      {isLoading ? (
        <View className="items-center py-3xl">
          <ActivityIndicator color={COLORS.brand} />
        </View>
      ) : (
        // 헤더("프로필"+톱니바퀴)는 전체 폭, 그 아래 콘텐츠는 1080px로 제한해서
        // 데스크탑에서 가운데 정렬. nativewind의 max-w-[...] 임의값 클래스가
        // FlashList 안에서 안 먹혀서 RN 인라인 style 숫자값으로 강제 지정한다.
        <View
          className="flex-1"
          style={device === 'desktop' ? { alignItems: 'center' } : undefined}
        >
          <View
            className="w-full flex-1"
            style={device === 'desktop' ? { maxWidth: 1080 } : undefined}
          >
            <FlashList
              data={posts}
              keyExtractor={keyExtractor}
              numColumns={columns}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              renderItem={renderItem}
              ListHeaderComponent={
                <>
                  <ProfileHeader
                    device={device}
                    displayName={profile?.displayName ?? ''}
                    username={profile?.username ?? ''}
                    postCountLabel={postCountLabel}
                    friendCount={
                      friendsQuery.isLoading
                        ? undefined
                        : friendsQuery.friends.length
                    }
                  />
                  <View className="border-t border-border px-xl py-2xl">
                    <Text className="font-bold text-primary">내 기록</Text>
                  </View>
                  {feedLoading && hasNoPosts && (
                    <View className="items-center py-xl">
                      <ActivityIndicator color={COLORS.brand} />
                    </View>
                  )}
                  {isError && hasNoPosts && (
                    <View className="items-center py-xl">
                      <Text className="text-error">
                        {(error as Error).message}
                      </Text>
                    </View>
                  )}
                  {!feedLoading && !isError && hasNoPosts && (
                    <View className="items-center py-xl">
                      <Text className="text-muted">
                        아직 올린 기록이 없어요
                      </Text>
                    </View>
                  )}
                </>
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View className="items-center py-lg">
                    <ActivityIndicator color={COLORS.brand} />
                  </View>
                ) : null
              }
            />
          </View>
        </View>
      )}

      {storyIndex !== null && (
        <StoryViewer
          posts={posts}
          startIndex={storyIndex}
          onClose={() => setStoryIndex(null)}
        />
      )}
    </View>
  );
}
