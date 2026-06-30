// expo-router 라우트 파일이 아닌 "정적 import 되는 일반 모듈"에서 불러와야 메트로의 CSS 추출 그래프에 잡힘
import "../../../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

// QueryClientProvider: tanstack-query 서버 데이터 캐시
const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </QueryClientProvider>
  );
}
