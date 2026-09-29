import { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
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
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { DayDetailContent } from './DayDetailContent';
import CrossIcon from '@/shared/assets/icons/cross.svg';
import type { PostSummary } from '@/entities/post/api/postsApi';

interface DayDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  date: Date;
  onChangeDate: (date: Date) => void;
  onOpenStory: (posts: PostSummary[], startIndex: number) => void;
  onOpenPost?: (postId: string) => void;
}

// 제스처가 활성화될 가로 움직임 기준값.
const ACTIVATE_OFFSET_X_PX = 10;
// 세로로 아래 설정값만큼 움직이면 제스처를 포기하고 세로 스크롤에 양보한다.
const FAIL_OFFSET_Y_PX = 15;

// 날짜를 넘길 거리는 화면 폭에 비례한다. (좁은 화면에서 고정값을 쓰면 너무 멀게 느껴질 수 있음)
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

// 넓은 화면 모달 크기.
const MODAL_WIDTH = 520;
// 높이는 창 높이에 비례해 잡는다.
const MODAL_MAX_HEIGHT = 820;
const MODAL_MAX_HEIGHT_RATIO = 0.85;
const CLOSE_RIGHT_INSET_PX = 28;
// heading 토큰의 행 높이
const HEADING_LINE_HEIGHT_PX = 26;
const HEADING_LINE_HEIGHT_DESKTOP_PX = 29;

// 캘린더 셀 선택 시 날짜 상세 표시.
// 폰은 바텀시트, 태블릿·데스크탑은 중앙 모달이다.
// 좌우로 스와이프하면 하루씩 앞뒤로 이동한다.
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
  onOpenPost,
}: DayDetailSheetProps) {
  const { width, height } = useWindowDimensions();
  const { device } = useBreakpoints();
  const modalMaxHeight = Math.min(
    MODAL_MAX_HEIGHT,
    height * MODAL_MAX_HEIGHT_RATIO
  );
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const commitDistancePx = Math.min(
    Math.max(width * COMMIT_DISTANCE_RATIO, COMMIT_DISTANCE_MIN_PX),
    COMMIT_DISTANCE_MAX_PX
  );

  const panGesture = useMemo(() => {
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

  const content = (
    <View className="select-none" style={{ flexShrink: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={animatedStyle}>
            <DayDetailContent
              date={date}
              onOpenStory={onOpenStory}
              onOpenPost={onOpenPost}
            />
          </Animated.View>
        </GestureDetector>
      </ScrollView>
    </View>
  );

  if (device !== 'phone') {
    if (!visible) return null;
    return (
      <Modal visible transparent animationType="fade" onRequestClose={onClose}>
        <View className="flex-1 items-center justify-center p-xl">
          {/* 배경 클릭으로도 닫힌다 */}
          <Pressable
            onPress={onClose}
            className="bg-black/60"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <View
            className="w-full overflow-hidden rounded-lg border border-border bg-page p-lg"
            style={{ maxWidth: MODAL_WIDTH, maxHeight: modalMaxHeight }}
          >
            {content}
            {/* 폰 시트는 배경 탭과 드래그 핸들로 닫지만, 모달에는 그런 단서가
                없어 명시적인 닫기 버튼을 둔다. 날짜 제목 줄 오른쪽 끝에 겹쳐
                놓는다 — 흐름에 넣으면 제목 위로 빈 줄이 하나 더 생긴다.
                content보다 뒤에 두는 건 RN Web에서 형제 View가 각각 독립된
                스택 컨텍스트라 z-index로는 위로 못 올라오기 때문이다. */}
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="absolute top-lg items-center justify-center"
              style={{
                right: CLOSE_RIGHT_INSET_PX,
                height:
                  device === 'desktop'
                    ? HEADING_LINE_HEIGHT_DESKTOP_PX
                    : HEADING_LINE_HEIGHT_PX,
              }}
            >
              <CrossIcon width={15} height={15} color={COLORS.textSecondary} />
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Sheet visible={visible} onClose={onClose}>
      {content}
    </Sheet>
  );
}
