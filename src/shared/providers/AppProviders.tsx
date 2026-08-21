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
      refetchOnWindowFocus: 'always',
      refetchOnMount: 'always',
    },
    mutations: {
      // 기본값 'online'이면 오프라인에서 뮤테이션이 실행되지 않고 paused 상태로
      // 대기한다. 에러가 안 나니 onError도 안 불려서 사용자는 아무 안내를 못 받고,
      // 온라인 복구 시 밀려 있던 요청이 한꺼번에 나간다.
      // 'always'로 두면 즉시 시도 → 실패 → onError → 에러 토스트로 이어진다.
      networkMode: 'always',
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
