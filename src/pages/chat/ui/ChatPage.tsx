import { View } from 'react-native';
import { ChatRoomList } from '@/widgets/chatRoomList';
import { ChatThread } from '@/widgets/chatThread';

export function ChatPage() {
  return (
    <View className="flex-1 flex-row bg-page">
      <ChatRoomList />
      <ChatThread roomName="홍길동" />
    </View>
  );
}
