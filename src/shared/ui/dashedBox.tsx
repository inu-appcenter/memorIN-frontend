import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { COLORS } from '@/shared/lib/theme';

interface DashedBoxProps extends ViewProps {
  borderRadius?: number;
  borderColor?: string;
}

// RN 기본 borderStyle="dashed"는 플랫폼마다 대시 길이/간격이 다르게 렌더링돼서
// SVG로 직접 그려 웹/네이티브에서 동일한 모양을 보장한다.
export function DashedBox({
  children,
  className,
  style,
  borderRadius = 20,
  borderColor = COLORS.border,
  ...rest
}: PropsWithChildren<DashedBoxProps>) {
  return (
    <View
      className={className}
      style={[{ overflow: 'hidden', borderRadius }, style]}
      {...rest}
    >
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Rect
          x={1}
          y={1}
          width="99%"
          height="99%"
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={borderColor}
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />
      </Svg>
      {children}
    </View>
  );
}
