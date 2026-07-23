import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '@/shared/ui/text';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { stories } from '@/shared/config/dummy';

export function StoryRail() {
  const { device } = useBreakpoints();

  return (
    <View className="border-b border-border px-lg py-md">
      {device === 'tablet' && (
        <Text className="mb-sm font-bold text-secondary">친구들의 오늘</Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-lg">
          {stories.map((name, index) => (
            <View key={name} className="items-center gap-xs">
              {index === 0 ? (
                <View className="h-[62px] w-[62px] items-center justify-center overflow-hidden rounded-full bg-page">
                  <Svg
                    width="100%"
                    height="100%"
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  >
                    <Circle
                      cx="50%"
                      cy="50%"
                      r={30}
                      fill="none"
                      stroke="#B8BCC7"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                    />
                  </Svg>
                  <Text className="text-[26px] font-bold leading-[26px] text-link">
                    +
                  </Text>
                </View>
              ) : (
                <View className="h-[62px] w-[62px] items-center justify-center rounded-full border-2 border-brand bg-subtle" />
              )}
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
