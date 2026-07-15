import { Redirect, Slot } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '@/shared/model/useAuthStore';

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
      <Slot />
    </View>
  );
}
