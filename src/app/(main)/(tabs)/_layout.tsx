import { Stack } from 'expo-router';
import { COLORS } from '@/shared/lib/theme';

// Slot에는 라우트 이력이 쌓이지 않아서 하드웨어·브라우저 뒤로가기가
// 의도대로 동작하지 않는다. Stack으로 바꿔 탭 이동 이력을 남기는 것으로 변경
export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'none',
        gestureEnabled: false,
      }}
    />
  );
}
