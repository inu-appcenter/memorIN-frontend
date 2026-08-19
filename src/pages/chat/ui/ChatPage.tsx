/* eslint-disable i18next/no-literal-string -- 목데이터 인명. 채팅 API 연동 시 제거될 하드코딩. */
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
