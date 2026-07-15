import { ScrollView, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { StoryRail } from './StoryRail';
import { FeedCard } from './FeedCard';
import { RightPanel } from './RightPanel';

export function FeedPage() {
  const { device } = useBreakpoints();
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
          {/* 전환 가능한 탭으로 수정필요*/}
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted">추천</Text>
          </View>
          {/* 전환 가능한 탭으로 수정필요 */}
          {/* 텍스트의 너비만큼 border-b-2 border-brand 되도록 수정필요 */}
          <View className="flex-1 items-center justify-center">
            <Text className="border-b-2 border-brand font-bold">팔로잉</Text>
          </View>
        </View>
        <ScrollView className="flex-1">
          <StoryRail />
          <View className="mx-auto w-full p-lg">
            <FeedCard name="홍길동" time="오늘 아침 08:24" />
            <FeedCard name="이서준" time="오늘 점심 12:40" />
          </View>
        </ScrollView>
      </View>
      <RightPanel />
    </View>
  );
}
