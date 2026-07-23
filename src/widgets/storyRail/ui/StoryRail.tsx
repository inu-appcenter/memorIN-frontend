import { ScrollView, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { stories } from '@/shared/config/dummy';

export function StoryRail() {
  return (
    <View className="border-b border-border px-lg py-md">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-lg">
          {stories.map((name, index) => (
            <View key={name} className="items-center gap-xs">
              <View className="h-[62px] w-[62px] items-center justify-center rounded-full border-2 border-brand bg-subtle">
                <Text className="text-link">{index === 0 ? '+' : ''}</Text>
              </View>
              <Text
                variant="caption"
                className={index === 0 ? 'text-link' : 'text-secondary'}
              >
                {name}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
