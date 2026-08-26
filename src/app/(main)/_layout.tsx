import { Redirect, Stack } from 'expo-router';
import { AppShell } from '@/widgets/appShell';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { COLORS } from '@/shared/lib/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function MainLayout() {
  const status = useAuthStore((state) => state.status);
  const { device } = useBreakpoints();
  const isPhone = device === 'phone';

  if (status === 'loading') {
    return null; // 부트스트랩 판정 동안 렌더 보류 (스플래시가 가림)
  }

  if (status === 'unauthenticated') {
    return <Redirect href="/sign-in" />;
  }

  return (
    <AppShell>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: isPhone ? 'slide_from_right' : 'none',
          gestureEnabled: isPhone,
        }}
      />
    </AppShell>
  );
}
