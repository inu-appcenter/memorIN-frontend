import { View } from 'react-native';
import { Text } from '@/shared/ui/text';

export function SocialPage() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text variant="title" className="text-primary">
        친구관리
      </Text>
      <Text variant="heading" className="text-secondary">
        친구관리페이지
      </Text>
    </View>
  );
}
