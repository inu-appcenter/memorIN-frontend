import { View } from 'react-native';
import { Text } from '@/shared/ui/text';

export function SocialPage() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text variant="h1" className="text-primary">
        팔로우/친구 관계
      </Text>
      <Text variant="h2" className="text-secondary">
        팔로우/친구 관계 페이지
      </Text>
    </View>
  );
}
