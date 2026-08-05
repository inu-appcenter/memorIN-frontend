import { useRef } from 'react';
import {
  Modal,
  PanResponder,
  Pressable,
  View,
  type ModalProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';

interface SheetProps extends Omit<ModalProps, 'visible'> {
  visible: boolean;
  onClose: () => void;
  className?: string;
}

const DISMISS_THRESHOLD_PX = 100;

// 하단에서 올라오는 시트 — 테블릿/폰의 날짜 상세, 댓글 목록 등에서 재사용
export function Sheet({
  visible,
  onClose,
  className,
  children,
  ...props
}: SheetProps) {
  const translateY = useSharedValue(0);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    backgroundColor: COLORS.background,
  }));

  // 핸들 바를 아래로 끌면 닫히고, 짧게 끌다 놓으면 원위치로 복귀한다.
  // 패닝 대상을 핸들 바로 한정해서 안에 있는 ScrollView(댓글 목록 등) 스크롤과 안 겹치게 한다.
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateY.value = gesture.dy;
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > DISMISS_THRESHOLD_PX) {
          onClose();
        }
        translateY.value = withSpring(0, { damping: 20 });
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      {...props}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute bottom-0 left-0 right-0 top-0 bg-black/40"
          onPress={onClose}
        />
        <Animated.View
          style={sheetStyle}
          className={cn('max-h-[80%] rounded-t-lg p-lg', className)}
        >
          <View
            {...panResponder.panHandlers}
            className="mb-md items-center py-sm"
          >
            <View className="h-[4px] w-[40px] rounded-full bg-border" />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
