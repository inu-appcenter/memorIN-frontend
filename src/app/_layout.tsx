import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { jwtDecode } from 'jwt-decode';
import { AppProviders } from '@/shared/providers/AppProviders';
import { PortalHost } from '@rn-primitives/portal';
import { ToastHost } from '@/shared/ui/toast';
import {
  tokenStorage,
  ACCESS_TOKEN_KEY,
} from '@/entities/session/lib/tokenStorage';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
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
      <ToastHost />
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

  // 재발급 인터셉터 테스트를 위한 코드 삽입 위치

  // 부트스트랩: 저장된 accessToken으로 로그인 상태 복원 (앱 시작 시 1회)
  useEffect(() => {
    tokenStorage.get(ACCESS_TOKEN_KEY).then((accessToken) => {
      if (!accessToken) {
        setUnauthenticated();
        return;
      }
      try {
        const { sub: userId, exp } = jwtDecode<{ sub: string; exp: number }>(
          accessToken
        );
        if (exp * 1000 <= Date.now()) {
          setUnauthenticated();
          return;
        }
        setAuthenticated(accessToken, { id: userId, email: '', nickname: '' });
      } catch {
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
