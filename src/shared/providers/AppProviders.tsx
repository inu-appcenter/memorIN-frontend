// expo-router 라우트 파일이 아닌 "정적 import 되는 일반 모듈"에서 불러오기 (메트로)
import '../../../global.css';

import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SocketProvider } from './SocketProvider';
import { PushProvider } from './PushProvider';

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

// refetchOnWindowFocus는 브라우저의 focus 이벤트에 기대는데 네이티브에는 그런
// 이벤트가 없다. AppState에 직접 연결해야 백그라운드에서 돌아올 때 재조회가
// 일어난다. 이게 없으면 푸시 알림을 탭하고 들어가도 화면이 캐시된 옛 데이터를
// 그대로 보여준다.
function useAppStateFocus() {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });

    return () => subscription.remove();
  }, []);
}

export function AppProviders({ children }: { children: ReactNode }) {
  useAppStateFocus();

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <SocketProvider>
          <PushProvider>{children}</PushProvider>
        </SocketProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
