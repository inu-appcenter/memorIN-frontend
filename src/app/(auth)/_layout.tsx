import { Redirect, Slot } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '@/features/auth';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/feed" />;
  }

  return (
    <View className="flex-1 bg-background">
      <Slot />
    </View>
  );
}
