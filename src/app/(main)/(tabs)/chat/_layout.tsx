import { Redirect, Stack, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import { CHAT_ENABLED } from '@/shared/config/features';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { COLORS } from '@/shared/lib/theme';
import { useSocketDemand } from '@/shared/lib/useSocketStore';
import { ChatRoomList } from '@/widgets/chatRoomList';

// 링크로 /chat/{roomId}에 바로 들어와도 목록이 스택 아래에 깔리도록 한다.
export const unstable_settings = {
  anchor: 'index',
};

// 레이아웃은 자식 화면의 useLocalSearchParams를 볼 수 없어서
// 지금 열려 있는 방 id를 경로 문자열에서 직접 읽는다.
function useActiveRoomId(): string | undefined {
  const pathname = usePathname();
  return /^\/chat\/([^/]+)/.exec(pathname)?.[1];
}

// 채팅이 꺼져 있으면 링크·채팅 알림으로 들어와도 피드로 보낸다. 알림 이동 경로
// 세 곳(NotificationsPage, notificationRoute, sw.js)은 그대로 두고 여기서 막는다.
export default function ChatRoute() {
  if (!CHAT_ENABLED) return <Redirect href="/feed" />;
  return <ChatLayout />;
}

function ChatLayout() {
  // 채팅 화면에 있는 동안에만 소켓을 붙인다. 소켓이 열려 있으면 백엔드가 푸시를
  // 보내지 않으므로(백엔드 #307) 앱 전역에서 연결하면 안 된다. 탭 레이아웃이
  // Stack이라 다른 탭으로 가도 이 레이아웃은 아래에 마운트된 채 남는다. 그래서
  // 마운트 여부가 아니라 현재 경로로 판단한다.
  const pathname = usePathname();
  useSocketDemand(pathname.startsWith('/chat'));

  const router = useRouter();
  const { device } = useBreakpoints();
  const isPhone = device === 'phone';
  const activeRoomId = useActiveRoomId();

  const handleSelectRoom = (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  // 768px 이상에서는 목록을 레이아웃이 들고 있는다. 라우트가 /chat ↔ /chat/{roomId}로
  // 바뀌어도 레이아웃은 다시 마운트되지 않으므로, 목록의 검색 상태와 스크롤 위치가
  // 그대로 유지된다. 폰에서는 목록과 대화창이 각각 전체 화면이라 목록을 여기서 그리지 않고
  // index 화면이 직접 그린다.
  //
  // 폭이 바뀔 때 Stack이 통째로 remount되지 않도록, 어느 device든 트리 모양을 같게 두고
  // key로 고정한다. 목록은 그 옆에서 조건부로 여닫히는 형제일 뿐이다.
  return (
    <View className="flex-1 flex-row bg-page">
      {!isPhone && (
        <ChatRoomList
          key="chat-room-list"
          activeRoomId={activeRoomId}
          onSelectRoom={handleSelectRoom}
        />
      )}

      <View key="chat-detail" className="flex-1">
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            // 폰에서만 밀어내기 전환. 분할 뷰에서는 오른쪽 패널만 갈아끼우는 거라
            // 슬라이드가 어색하다.
            animation: isPhone ? 'slide_from_right' : 'none',
            gestureEnabled: isPhone,
          }}
        />
      </View>
    </View>
  );
}
