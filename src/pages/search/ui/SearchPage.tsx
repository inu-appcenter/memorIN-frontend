import { ScrollView, View } from 'react-native';
import { Text } from '@/shared/ui/text';

const items = Array.from({ length: 24 }, (_, index) => index);

export function SearchPage() {
  return (
    <View className="flex-1 bg-page">
      <View className="flex-row items-center gap-md border-b border-border px-lg py-lg">
        <View className="h-[44px] flex-1 justify-center rounded-md bg-surface px-lg">
          <Text className="text-muted">⌕ 기록 · 순간 검색</Text>
        </View>
        <View className="h-[34px] w-[34px] rounded-full border border-border bg-subtle" />
      </View>
      <ScrollView className="flex-1" contentContainerClassName="flex-row flex-wrap gap-sm p-lg">
        {items.map((item) => (
          <View
            key={item}
            className="aspect-square min-w-[96px] flex-1 basis-[30%] items-center justify-center rounded-sm border border-dashed border-border bg-surface"
          >
            <Text className="text-tertiary">{item % 4 === 2 ? '▷' : 'IMG'}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
