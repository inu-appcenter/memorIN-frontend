import { Redirect, Slot } from 'expo-router';
import { AppShell } from '@/widgets/appShell';
import { useAuthStore } from '@/shared/model/useAuthStore';

export default function MainLayout() {
  const status = useAuthStore((state) => state.status);

  if (status === 'loading') {
    return null; // 부트스트랩 판정 동안 렌더 보류 (스플래시가 가림)
  }

  if (status === 'unauthenticated') {
    return <Redirect href="/sign-in" />;
  }

  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
