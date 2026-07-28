import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface StoryProgressBarProps {
  count: number;
  activeIndex: number;
  durationMs: number | null; // null이면(영상 길이 로딩 전) 아직 채우기 시작 안 함
  onComplete: () => void;
}

// 인스타 스토리처럼 세그먼트별로 채워지는 진행바.
// 이미지는 고정 5초, 동영상은 실제 길이만큼 채워진 뒤 다음 미디어로 자동 전환한다.
export function StoryProgressBar({
  count,
  activeIndex,
  durationMs,
  onComplete,
}: StoryProgressBarProps) {
  return (
    <View className="flex-row gap-xs p-md">
      {Array.from({ length: count }, (_, index) => {
        if (index < activeIndex) {
          return (
            <View
              key={index}
              className="h-[3px] flex-1 rounded-full bg-white"
            />
          );
        }
        if (index > activeIndex) {
          return (
            <View
              key={index}
              className="h-[3px] flex-1 rounded-full bg-white/30"
            />
          );
        }
        return (
          <ActiveSegment
            key={index}
            durationMs={durationMs}
            onComplete={onComplete}
          />
        );
      })}
    </View>
  );
}

function ActiveSegment({
  durationMs,
  onComplete,
}: {
  durationMs: number | null;
  onComplete: () => void;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    if (durationMs == null) return;
    progress.value = withTiming(
      1,
      { duration: durationMs, reduceMotion: ReduceMotion.Never },
      (finished) => {
        if (finished) runOnJS(onComplete)();
      }
    );
    return () => {
      cancelAnimation(progress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <View className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
      <Animated.View
        style={[
          {
            height: '100%',
            width: '100%',
            borderRadius: 999,
            backgroundColor: '#FFFFFF',
            transformOrigin: 'left',
          },
          style,
        ]}
      />
    </View>
  );
}
