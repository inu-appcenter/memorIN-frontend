import { View } from 'react-native';
import { Text } from '@/shared/ui/text';

export function FeedPage() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text variant="h1" className="text-primary">
        캘린더 뷰
      </Text>
      <Text variant="h2" className="text-secondary">
        피드페이지
      </Text>
    </View>
  );
}
