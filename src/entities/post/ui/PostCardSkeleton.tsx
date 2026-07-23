import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// 초기 로딩 중 실제 카드와 비슷한 레이아웃을 펄스 애니메이션으로 보여줘서
// 빈 화면/텍스트보다 로딩 체감을 자연스럽게 만든다.
export function PostCardSkeleton() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const shimmerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={shimmerStyle}
      className="mb-lg overflow-hidden rounded-lg border border-border bg-page"
    >
      <View className="gap-sm p-lg">
        <View className="flex-row items-center gap-md">
          <View className="h-[34px] w-[34px] rounded-full bg-surface" />
          <View className="gap-xs">
            <View className="h-[14px] w-[100px] rounded bg-surface" />
            <View className="h-[12px] w-[70px] rounded bg-surface" />
          </View>
        </View>
      </View>
      <View className="h-[360px] w-full bg-surface" />
      <View className="gap-sm p-lg">
        <View className="h-[14px] w-[80%] rounded bg-surface" />
        <View className="h-[14px] w-[50%] rounded bg-surface" />
      </View>
    </Animated.View>
  );
}
