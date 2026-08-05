// expo-router 라우트 파일이 아닌 "정적 import 되는 일반 모듈"에서 불러오기 (메트로)
import '../../../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1분 — 이 안에는 재요청 없이 캐시 사용
      retry: 1, // 기본 1회만 재시도
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </QueryClientProvider>
  );
}
