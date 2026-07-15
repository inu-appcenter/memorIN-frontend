import { View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { useRouter } from 'expo-router';
import { Button } from '@/shared/ui/button';

export default function Page() {
  const router = useRouter();
  return (
    <View className="flex-1 flex-col items-center justify-center gap-4">
      <Text variant="h1" className="text-primary">
        루트페이지
      </Text>
      <View className="flex-row gap-2">
        <Button onPress={() => router.push('/feed')}>
          <Text>피드</Text>
        </Button>
        <Button onPress={() => router.push('/feed')}>
          <Text>채팅</Text>
        </Button>
        <Button onPress={() => router.push('/feed')}>
          <Text>프로필</Text>
        </Button>
        <Button onPress={() => router.push('/feed')}>
          <Text>친구</Text>
        </Button>
      </View>
    </View>
  );
}
