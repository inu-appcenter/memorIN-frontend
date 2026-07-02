import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { AppProviders } from "@/shared/providers/AppProviders";

function RootNav() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#121110" }, // 모든 스크린 기본 배경
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Pretendard-Regular": require("@/shared/assets/fonts/Pretendard-Regular.otf"),
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
