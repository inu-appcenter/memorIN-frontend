import { Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { MessageBubble } from '@/entities/message';
import { dummyMessages } from '@/shared/config/dummy';
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';
import { ChatInputBar } from './ChatInputBar';

interface ChatThreadProps {
  roomName: string;
  // 폰 전용 대화창 화면에서만 넘어온다. 태블릿·데스크탑 분할 뷰에서는
  // 목록이 옆에 그대로 있어 뒤로가기가 필요 없다.
  onPressBack?: () => void;
}

// 선택된 채팅방의 대화창 — 상대 이름 헤더 + 메시지 목록 + 입력창
export function ChatThread({ roomName, onPressBack }: ChatThreadProps) {
  return (
    <View className="flex-1 bg-surface">
      <View className="h-[63px] flex-row items-center justify-between border-b border-border bg-page px-xl">
        <View className="flex-row items-center gap-md">
          {onPressBack && (
            <Pressable onPress={onPressBack} hitSlop={8}>
              <ArrowLeftIcon width={20} height={20} color={COLORS.text} />
            </Pressable>
          )}
          <Text className="font-bold">{roomName}</Text>
        </View>
      </View>
      <View className="flex-1 gap-lg p-xl">
        {dummyMessages.map((message) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            isMine={message.isMine}
          />
        ))}
      </View>
      <ChatInputBar />
    </View>
  );
}
