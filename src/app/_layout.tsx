import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "@/shared/providers/AppProviders";

function RootNav() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNav />
    </AppProviders>
  );
}
