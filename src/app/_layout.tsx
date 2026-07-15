import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { AppProviders } from '@/shared/providers/AppProviders';
import { PortalHost } from '@rn-primitives/portal';
import '../../global.css';

function RootNav() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      />
      {/* reusable 컴포넌트 사용 시 필요 */}
      <PortalHost />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Pretendard-Regular': require('@/shared/assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Bold': require('../shared/assets/fonts/Pretendard-Bold.otf'),
  });

  if (!loaded && !error) {
    return null;
  }
  return (
    <AppProviders>
      <RootNav />
    </AppProviders>
  );
}
