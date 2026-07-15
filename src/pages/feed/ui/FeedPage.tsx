import { ScrollView, View } from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@/shared/ui/text';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';

const stories = ['내 기록', '홍길동', '이서준', '박지민', '최유나', '정우'];

function StoryRail() {
  return (
    <View className="border-b border-border px-lg py-md">
      <Text className="mb-md text-secondary">친구들의 오늘</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-lg">
          {stories.map((name, index) => (
            <View key={name} className="items-center gap-xs">
              <View className="h-[62px] w-[62px] items-center justify-center rounded-full border-2 border-brand bg-subtle">
                <Text className="text-link">{index === 0 ? '+' : ''}</Text>
              </View>
              <Text variant="caption" className={index === 0 ? 'text-link' : 'text-secondary'}>
                {name}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function FeedCard({ name, time }: { name: string; time: string }) {
  return (
    <View className="mb-lg overflow-hidden rounded-lg border border-border bg-page">
      <View className="gap-sm p-lg">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-md">
            <View className="h-[34px] w-[34px] rounded-full border border-border bg-subtle" />
            <View>
              <Text className="font-bold">{name}</Text>
              <Text className="text-muted">{time}</Text>
            </View>
          </View>
          <Text className="text-tertiary">•••</Text>
        </View>
        <View className="self-start rounded-full bg-accent-subtle px-sm py-xs">
          <Text className="text-accent-text">오전</Text>
        </View>
      </View>
      <View className="h-[360px] items-center justify-center border-y border-dashed border-border bg-surface">
        <Text className="text-tertiary">IMG</Text>
      </View>
      <View className="gap-md p-lg">
        <Text className="text-secondary">오늘 아침의 상쾌한 공기와 함께 산책을 다녀왔어요.</Text>
        <View className="flex-row gap-xl">
          <Text className="text-tertiary">♡ 12</Text>
          <Text className="text-tertiary">○ 3</Text>
          <Text className="text-tertiary">⇧</Text>
        </View>
      </View>
    </View>
  );
}

function RightPanel() {
  return (
    <View className="hidden w-[320px] border-l border-border p-lg desktop:flex">
      <View className="mb-xl flex-row items-center justify-between">
        <View className="flex-row items-center gap-md">
          <View className="h-[48px] w-[48px] rounded-full border border-border bg-subtle" />
          <View>
            <Text className="font-bold">yujeong737</Text>
            <Text className="text-muted">박지호</Text>
          </View>
        </View>
        <Link href="/profile">
          <Text className="font-bold text-link">내 프로필</Text>
        </Link>
      </View>
      <View className="mb-md flex-row justify-between">
        <Text className="font-bold text-secondary">추천 친구</Text>
        <Text className="text-secondary">모두 보기</Text>
      </View>
      {['김도윤', '이서율', '최하린', '한소희', '정우진'].map((name) => (
        <View key={name} className="mb-lg flex-row items-center justify-between">
          <View className="flex-row items-center gap-md">
            <View className="h-[42px] w-[42px] rounded-full bg-subtle" />
            <View>
              <Text className="font-bold">{name}</Text>
              <Text className="text-muted">새로운 친구</Text>
            </View>
          </View>
          <Text className="font-bold text-link">추가</Text>
        </View>
      ))}
    </View>
  );
}

export function FeedPage() {
  const { device } = useBreakpoints();

  return (
    <View className="flex-1 flex-row bg-page">
      <View className="flex-1">
        <View className="h-[58px] flex-row items-center justify-between border-b border-border px-lg">
          <Text variant="h1">피드</Text>
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
          <View className="flex-1 items-center justify-center border-b-2 border-brand">
            <Text className="font-bold">팔로잉</Text>
          </View>
        </View>
        <ScrollView className="flex-1">
          <StoryRail />
          <View className="mx-auto w-full max-w-[620px] p-lg">
            <FeedCard name="홍길동" time="오늘 아침 08:24" />
            <FeedCard name="이서준" time="오늘 점심 12:40" />
          </View>
        </ScrollView>
      </View>
      <RightPanel />
    </View>
  );
}
