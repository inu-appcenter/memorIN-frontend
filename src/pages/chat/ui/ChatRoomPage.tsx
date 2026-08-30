import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { dummyChatRooms } from '@/shared/config/dummy';
import { ChatThread } from '@/widgets/chatThread';
import { ChatEmptyState } from './ChatEmptyState';

interface ChatRoomPageProps {
  roomId: string;
}

// /chat/{roomId}
// 폰에서는 전체 화면, 768px 이상에서는 레이아웃이 그린 목록 오른쪽에 놓인다.
export function ChatRoomPage({ roomId }: ChatRoomPageProps) {
  const router = useRouter();
  const { device } = useBreakpoints();
  const isPhone = device === 'phone';

  const room = dummyChatRooms.find((item) => item.id === roomId);

  // 헤더의 ←는 뒤로가기(Back)가 아니라 위로(Up) 버튼이다. 목록에서 들어왔든
  // 링크로 바로 들어왔든 대화창의 부모는 언제나 채팅 목록이다.
  // 분할 뷰에서는 목록이 옆에 그대로 있으므로 버튼 자체를 두지 않는다.
  const handleBack = () => {
    router.navigate('/chat');
  };

  if (!room) {
    return <ChatEmptyState notFound />;
  }

  return (
    <View className="flex-1 bg-page">
      <ChatThread room={room} onPressBack={isPhone ? handleBack : undefined} />
    </View>
  );
}
