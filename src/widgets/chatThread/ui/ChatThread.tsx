import { View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { MessageBubble } from '@/entities/message';
import { dummyMessages } from '@/shared/config/dummy';
import { ChatInputBar } from './ChatInputBar';

interface ChatThreadProps {
  roomName: string;
}

// 선택된 채팅방의 대화창 — 상대 이름 헤더 + 메시지 목록 + 입력창
export function ChatThread({ roomName }: ChatThreadProps) {
  return (
    <View className="hidden flex-1 bg-surface tablet:flex">
      <View className="h-[66px] flex-row items-center justify-between border-b border-border bg-page px-xl">
        <View className="flex-row items-center gap-md">
          <View className="h-[38px] w-[38px] rounded-full bg-subtle" />
          <Text className="font-bold">{roomName}</Text>
        </View>
        <Text className="text-[22px]">•••</Text>
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
