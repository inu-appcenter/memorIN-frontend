import { useLocalSearchParams } from 'expo-router';
import { ChatRoomPage } from '@/pages/chatRoom';

export default function ChatRoomRoute() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  return <ChatRoomPage roomId={roomId} />;
}
