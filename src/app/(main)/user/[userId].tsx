import { useLocalSearchParams } from 'expo-router';
import { UserProfilePage } from '@/pages/userProfile';

export default function UserProfileRoute() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  return <UserProfilePage userId={userId} />;
}
