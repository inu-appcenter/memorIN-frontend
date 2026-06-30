// expo-router 라우트 파일이 아닌 "정적 import 되는 일반 모듈"에서 불러오기 (메트로)
import "../../../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </QueryClientProvider>
  );
}
