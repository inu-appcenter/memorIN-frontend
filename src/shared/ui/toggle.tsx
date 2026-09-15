import { Pressable, View } from 'react-native';
import { COLORS } from '@/shared/lib/theme';

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 30;
const KNOB_SIZE = 24;
const KNOB_INSET = 3;

interface ToggleProps {
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}

// 알약형 토글. RN Switch는 플랫폼마다 트랙 모양과 색 적용 범위가 다름.
export function Toggle({ value, onChange, disabled }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={{
        width: TRACK_WIDTH,
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        backgroundColor: value ? COLORS.blue500 : COLORS.border,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: KNOB_INSET,
          left: value ? TRACK_WIDTH - KNOB_SIZE - KNOB_INSET : KNOB_INSET,
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          borderRadius: KNOB_SIZE / 2,
          backgroundColor: COLORS.white,
        }}
      />
    </Pressable>
  );
}
