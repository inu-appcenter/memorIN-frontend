import { useEffect } from 'react';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { CommentThread } from '@/entities/post/ui/CommentThread';
import { COLORS } from '@/shared/lib/theme';

interface FeedCommentPanelProps {
  postId: string;
  onClose: () => void;
}

const PANEL_WIDTH_PX = 320;
const SLIDE_DISTANCE_PX = 40;
const ANIMATION_DURATION_MS = 220;

export function FeedCommentPanel({ postId, onClose }: FeedCommentPanelProps) {
  const translateX = useSharedValue(SLIDE_DISTANCE_PX);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(0, {
      duration: ANIMATION_DURATION_MS,
      reduceMotion: ReduceMotion.Never,
    });
    opacity.value = withTiming(1, {
      duration: ANIMATION_DURATION_MS,
      reduceMotion: ReduceMotion.Never,
    });
  }, [translateX, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: PANEL_WIDTH_PX,
          borderLeftWidth: 1,
          borderLeftColor: COLORS.border,
        },
        animatedStyle,
      ]}
      className="hidden desktop:flex"
    >
      <CommentThread postId={postId} onClose={onClose} />
    </Animated.View>
  );
}
