import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { dummyChatRooms } from '@/shared/config/dummy';
import { ChatRoomList } from '@/widgets/chatRoomList';
import { ChatThread } from '@/widgets/chatThread';

// 폰: 목록만 보여주고 방을 누르면 /chat/[roomId] 화면으로 이동한다.
// 태블릿·데스크탑: 목록과 대화창을 나란히 두고, 선택은 라우팅 없이
// 로컬 상태로만 바꾼다(분할 뷰에서 화면을 갈아끼울 이유가 없다).
export function ChatPage() {
  const router = useRouter();
  const { device } = useBreakpoints();
  const isPhone = device === 'phone';

  const [selectedRoomId, setSelectedRoomId] = useState(
    dummyChatRooms[0]?.id ?? ''
  );
  const selectedRoom = dummyChatRooms.find(
    (room) => room.id === selectedRoomId
  );

  const handleSelectRoom = (roomId: string) => {
    if (isPhone) {
      router.push(`/chat/${roomId}`);
      return;
    }
    setSelectedRoomId(roomId);
  };

  return (
    <View className="flex-1 flex-row bg-page">
      <ChatRoomList
        activeRoomId={isPhone ? undefined : selectedRoomId}
        onSelectRoom={handleSelectRoom}
      />
      {!isPhone && selectedRoom && <ChatThread roomName={selectedRoom.name} />}
    </View>
  );
}
