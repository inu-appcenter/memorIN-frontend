import { Text } from '@/shared/ui/text';
import { View } from 'react-native';

interface PostCardProps {
  name: string;
  time: string;
}

// 게시물 하나를 표현하는 카드 (피드/프로필 등에서 재사용)
export function PostCard({ name, time }: PostCardProps) {
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
        <Text className="text-secondary">
          오늘 아침의 상쾌한 공기와 함께 산책을 다녀왔어요.
        </Text>
        <View className="flex-row gap-xl">
          <Text className="text-tertiary">♡ 12</Text>
          <Text className="text-tertiary">○ 3</Text>
          <Text className="text-tertiary">⇧</Text>
        </View>
      </View>
    </View>
  );
}
