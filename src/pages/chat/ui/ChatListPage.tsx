import { useRouter } from 'expo-router';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { ChatRoomList } from '@/widgets/chatRoomList';
import { ChatEmptyState } from './ChatEmptyState';

// /chat
// 폰에서는 목록 자체가 하나의 화면이다.
// 768px 이상에서는 목록을 레이아웃이 들고 있으므로, 여기서는 대화창 자리에
// 들어갈 빈 상태만 그린다.
export function ChatListPage() {
  const router = useRouter();
  const { device } = useBreakpoints();

  if (device !== 'phone') {
    return <ChatEmptyState />;
  }

  return (
    <ChatRoomList
      onSelectRoom={(roomId) => router.push(`/chat/${roomId}`)}
      showNewChat
    />
  );
}
