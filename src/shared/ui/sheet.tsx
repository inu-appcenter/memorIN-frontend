import { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  View,
  type ModalProps,
} from 'react-native';
import Animated, {
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
interface SheetProps extends Omit<ModalProps, 'visible'> {
  visible: boolean;
  onClose: () => void;
  className?: string;
  maxHeightRatio?: number; // 화면 높이 대비 최대 비율 (기본 0.8)
}

const ANIMATION_DURATION_MS = 220;
const CONTENT_OFFSCREEN_TRANSLATE_Y = 400;
const DEFAULT_MAX_HEIGHT_RATIO = 0.8;

// 하단에서 올라오는 시트 — 테블릿/폰의 날짜 상세, 댓글 목록 등에서 재사용

// 오버레이(opacity)와 콘텐츠(translateY)를 각각 독립된 reanimated 애니메이션으로 분리
// 닫을 때도 애니메이션이 끝난 뒤에 실제로 언마운트하도록 mounted 상태를 별도 관리
export function Sheet({
  visible,
  onClose,
  className,
  maxHeightRatio = DEFAULT_MAX_HEIGHT_RATIO,
  children,
  ...props
}: SheetProps) {
  const [mounted, setMounted] = useState(visible);
  const overlayOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(CONTENT_OFFSCREEN_TRANSLATE_Y);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      overlayOpacity.value = withTiming(1, {
        duration: ANIMATION_DURATION_MS,
        reduceMotion: ReduceMotion.Never,
      });
      contentTranslateY.value = withTiming(0, {
        duration: ANIMATION_DURATION_MS,
        reduceMotion: ReduceMotion.Never,
      });
    } else {
      overlayOpacity.value = withTiming(0, {
        duration: ANIMATION_DURATION_MS,
        reduceMotion: ReduceMotion.Never,
      });
      contentTranslateY.value = withTiming(
        CONTENT_OFFSCREEN_TRANSLATE_Y,
        { duration: ANIMATION_DURATION_MS, reduceMotion: ReduceMotion.Never },
        (finished) => {
          if (finished) {
            runOnJS(setMounted)(false);
          }
        }
      );
    }
  }, [visible, overlayOpacity, contentTranslateY]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  if (!mounted) return null;

  const maxHeight = Dimensions.get('window').height * maxHeightRatio;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      {...props}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 justify-end">
          <Animated.View
            style={[
              { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
              overlayStyle,
            ]}
          >
            <Pressable className="flex-1 bg-black/40" onPress={onClose} />
          </Animated.View>
          <Animated.View
            style={[
              contentStyle,
              {
                maxHeight,
                overflow: 'hidden',
                backgroundColor: COLORS.background,
                // 패딩을 className으로 주면 호출부가 넘긴 className과 병합될 때
                // 적용 순서가 보장되지 않는다(p-0/pt-* 조합이 무시되는 경우가 있음).
                // 시트 여백은 여기서 인라인으로 못박고, className은 높이 등 나머지만 받는다.
                paddingTop: 12,
                paddingHorizontal: 16,
                paddingBottom: 16,
              },
            ]}
            className={cn('rounded-t-lg', className)}
          >
            <View className="mb-md h-[4px] w-[40px] self-center rounded-full bg-border" />
            {children}
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
