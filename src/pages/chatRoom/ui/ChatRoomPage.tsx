import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { dummyChatRooms } from '@/shared/config/dummy';
import { ChatThread } from '@/widgets/chatThread';

interface ChatRoomPageProps {
  roomId: string;
}

// 폰 전용 대화창 화면. 태블릿·데스크탑에는 목록과 대화창을 함께 보여주는
// 분할 뷰(/chat)가 있으므로, 그 폭에서는 이 화면에 머무르지 않고 되돌린다.
export function ChatRoomPage({ roomId }: ChatRoomPageProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { device } = useBreakpoints();
  const isPhone = device === 'phone';

  const room = dummyChatRooms.find((item) => item.id === roomId);

  // 폰에서 대화창을 연 채 창을 넓히거나, 넓은 폭에서 URL로 직접 들어온 경우
  // 분할 뷰로 보낸다. 보고 있던 방을 파라미터로 넘겨 선택 상태를 유지한다.
  useEffect(() => {
    if (isPhone) return;
    router.navigate({ pathname: '/chat', params: { roomId } });
  }, [isPhone, roomId, router]);

  // 리다이렉트가 적용되기 전 한 프레임 동안 대화창이 스치는 걸 막는다.
  if (!isPhone) return null;

  // 헤더의 ←는 뒤로가기(Back)가 아니라 위로(Up) 버튼이다. 목록에서 들어왔든 링크로 바로 들어왔든 대화창의 부모는 언제나 채팅 목록
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
