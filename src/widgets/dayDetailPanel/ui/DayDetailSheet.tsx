import { useMemo } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Sheet } from '@/shared/ui/sheet';
import { addDays } from '@/shared/lib/calendarDate';
import { DayDetailContent } from './DayDetailContent';
import type { PostSummary } from '@/entities/post/api/postsApi';

interface DayDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  date: Date;
  onChangeDate: (date: Date) => void;
  onOpenStory: (posts: PostSummary[], startIndex: number) => void;
}

// 이만큼 가로로 움직이면 제스처가 활성화된다(그 전까지는 스크롤/탭이 정상 동작).
const ACTIVATE_OFFSET_X_PX = 10;
// 세로로 이만큼 움직이면 제스처를 포기하고 세로 스크롤에 양보한다.
const FAIL_OFFSET_Y_PX = 15;

// 날짜를 넘길 거리는 화면 폭에 비례한다. 좁은 화면에서 고정값을 쓰면
// 상대적으로 너무 멀게 느껴진다.
const COMMIT_DISTANCE_RATIO = 0.12;
const COMMIT_DISTANCE_MIN_PX = 28;
const COMMIT_DISTANCE_MAX_PX = 80;
// 거리가 모자라도 이만큼 빠르게 튕기면 넘어간다 (px/s)
const COMMIT_VELOCITY = 400;

// 손가락을 따라가는 정도. 1이면 그대로 따라가 화면 밖까지 나가버린다.
const DRAG_DAMPING = 0.4;
// 새 날짜 내용이 이만큼 떨어진 곳에서 제자리로 들어온다
const ENTER_OFFSET_PX = 48;
const ENTER_DURATION_MS = 200;
const SPRING_BACK_DURATION_MS = 150;

// 테블릿/폰 전용 — 캘린더 셀 선택 시 바텀시트로 날짜 상세 표시.
// 시트가 열린 상태에서 좌우로 스와이프하면 하루씩 앞뒤로 이동한다.
//
// PanResponder 대신 gesture-handler를 쓴다. 세로 ScrollView 안에서 가로
// 스와이프를 잡으려면 (1) 안드로이드 네이티브 스크롤의 터치 가로채기,
// (2) 자식 Pressable이 먼저 responder를 쥐는 문제를 모두 넘겨야 하는데,
// activeOffsetX / failOffsetY가 이를 네이티브 레벨에서 처리해준다.
export function DayDetailSheet({
  visible,
  onClose,
  date,
  onChangeDate,
  onOpenStory,
}: DayDetailSheetProps) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const commitDistancePx = Math.min(
    Math.max(width * COMMIT_DISTANCE_RATIO, COMMIT_DISTANCE_MIN_PX),
    COMMIT_DISTANCE_MAX_PX
  );

  const panGesture = useMemo(() => {
    // direction: 1이면 다음 날, -1이면 이전 날.
    // 날짜를 먼저 바꾸고 새 내용이 반대편에서 들어오게 한다. 나가는
    // 애니메이션과 상태 변경을 맞물리게 하면 동기화가 복잡해지는데,
    // 들어오는 연출만으로도 방향은 충분히 전달된다.
    const commit = (direction: 1 | -1) => {
      onChangeDate(addDays(date, direction));
      translateX.value = direction * ENTER_OFFSET_PX;
      opacity.value = 0;
      translateX.value = withTiming(0, {
        duration: ENTER_DURATION_MS,
        reduceMotion: ReduceMotion.Never,
      });
      opacity.value = withTiming(1, {
        duration: ENTER_DURATION_MS,
        reduceMotion: ReduceMotion.Never,
      });
    };

    return Gesture.Pan()
      .activeOffsetX([-ACTIVATE_OFFSET_X_PX, ACTIVATE_OFFSET_X_PX])
      .failOffsetY([-FAIL_OFFSET_Y_PX, FAIL_OFFSET_Y_PX])
      .onUpdate((event) => {
        translateX.value = event.translationX * DRAG_DAMPING;
      })
      .onEnd((event) => {
        const passedDistance = Math.abs(event.translationX) > commitDistancePx;
        const passedVelocity = Math.abs(event.velocityX) > COMMIT_VELOCITY;

        if (passedDistance || passedVelocity) {
          runOnJS(commit)(event.translationX < 0 ? 1 : -1);
          return;
        }
        translateX.value = withTiming(0, {
          duration: SPRING_BACK_DURATION_MS,
          reduceMotion: ReduceMotion.Never,
        });
      });
  }, [date, onChangeDate, translateX, opacity, commitDistancePx]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Sheet visible={visible} onClose={onClose}>
      {/* flexShrink: 1이 없으면 이 래퍼가 내용 높이만큼 늘어나 시트의
          maxHeight를 넘고, 안쪽 ScrollView가 스크롤되지 않는다.
          select-none은 웹에서 드래그가 텍스트 선택으로 해석돼 제스처를
          방해하는 걸 막는다(RN ViewStyle 타입에 userSelect가 없어 클래스로 준다). */}
      <View className="select-none" style={{ flexShrink: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={animatedStyle}>
              <DayDetailContent date={date} onOpenStory={onOpenStory} />
            </Animated.View>
          </GestureDetector>
        </ScrollView>
      </View>
    </Sheet>
  );
}
