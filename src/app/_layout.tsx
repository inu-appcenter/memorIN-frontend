import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { AppProviders } from '@/shared/providers/AppProviders';
import { PortalHost } from '@rn-primitives/portal';
import { fetchMe } from '@/shared/api/authApi';
import { useAuthStore } from '@/shared/model/useAuthStore';
import '../../global.css';

function RootNav() {
  return (
    <>
      <StatusBar style="dark" />
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
    'Pretendard-Bold': require('@/shared/assets/fonts/Pretendard-Bold.otf'),
  });

  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUnauthenticated = useAuthStore((s) => s.setUnauthenticated);

  // 부트스트랩: 저장된 세션으로 로그인 상태 복원 (앱 시작 시 1회)
  useEffect(() => {
    fetchMe().then((user) => {
      if (user) {
        setAuthenticated('mock-access-token', user); // 실연동 시 refresh가 새 accessToken 발급
      } else {
        setUnauthenticated();
      }
    });
  }, [setAuthenticated, setUnauthenticated]);

  if (!loaded && !error) {
    return null;
  }
  return (
    <AppProviders>
      <RootNav />
    </AppProviders>
  );
}
