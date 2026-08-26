import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { COLORS } from '@/shared/lib/theme';

export default function AuthLayout() {
  const status = useAuthStore((state) => state.status);

  if (status === 'loading') {
    return null;
  }

  if (status === 'authenticated') {
    return <Redirect href="/feed" />;
  }

  return (
    <View className="flex-1 bg-page">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      />
    </View>
  );
}
