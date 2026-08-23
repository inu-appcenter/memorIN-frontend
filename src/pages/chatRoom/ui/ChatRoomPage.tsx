import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { dummyChatRooms } from '@/shared/config/dummy';
import { ChatThread } from '@/widgets/chatThread';

interface ChatRoomPageProps {
  roomId: string;
}

// 폰 전용 대화창 화면. 태블릿·데스크탑에서는 ChatPage의 분할 뷰가 같은
// 역할을 하므로 보통 여기까지 오지 않지만, 직접 URL로 들어와도 동작한다.
export function ChatRoomPage({ roomId }: ChatRoomPageProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const room = dummyChatRooms.find((item) => item.id === roomId);

  // 이 앱의 (main)/(tabs) 레이아웃은 Stack이 아니라 Slot이라 라우트 스택이
  // 쌓이지 않는다. router.back()을 쓰면 채팅 목록이 아니라 직전에 보던
  // 화면(피드 등)으로 튕기므로 목적지를 명시해서 이동한다.
  const handleBack = () => {
    router.navigate('/chat');
  };

  if (!room) {
    return (
      <View className="flex-1 items-center justify-center bg-page px-xl">
        <Text className="text-muted">{t('chat.roomNotFound')}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-page">
      <ChatThread roomName={room.name} onPressBack={handleBack} />
    </View>
  );
}
