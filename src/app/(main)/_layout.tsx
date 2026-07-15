import { Slot } from 'expo-router';
import { AppShell } from '@/widgets/appShell';

export default function MainLayout() {
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
