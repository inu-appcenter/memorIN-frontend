import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { MessageBubble } from '@/entities/message';
import {
  dummyMessages,
  type DummyMessage,
  type DummyChatRoom,
} from '@/shared/config/dummy';
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';
import { ChatInputBar } from './ChatInputBar';

interface ChatThreadProps {
  room: DummyChatRoom;
  // 폰 전용 대화창에서만 넘어온다. 분할 뷰에서는 목록이 옆에 있어 필요 없다.
  onPressBack?: () => void;
}

// 선택된 채팅방의 대화창 — 헤더 + 메시지 목록 + 입력창
//
// 메시지는 목업 데이터 고정. 조회/전송 API를 붙일 수 없는 상태라 화면 구조만 맞춤.
export function ChatThread({ room, onPressBack }: ChatThreadProps) {
  // inverted 리스트는 배열 앞쪽을 화면 아래에 그린다. 목데이터는 읽기 쉽게
  // 시간순으로 두고 여기서 뒤집는다.
  const messages = useMemo(() => [...dummyMessages].reverse(), []);

  const renderItem = useCallback(
    ({ item }: { item: DummyMessage }) => (
      <MessageBubble content={item.content} isMine={item.isMine} />
    ),
    []
  );

  const keyExtractor = useCallback((message: DummyMessage) => message.id, []);

  return (
    <View className="flex-1 bg-surface">
      <View className="h-[63px] flex-row items-center justify-between border-b border-border bg-page px-xl">
        <View className="flex-row items-center gap-md">
          {onPressBack && (
            <Pressable onPress={onPressBack} hitSlop={8}>
              <ArrowLeftIcon width={20} height={20} color={COLORS.text} />
            </Pressable>
          )}
          <Text className="font-bold">{room.name}</Text>
          {room.isGroup && (
            <Text variant="caption" className="text-muted">
              {room.memberCount}
            </Text>
          )}
        </View>
      </View>

      {/* 메시지가 많아도 헤더와 입력창은 고정되고 이 영역만 스크롤된다.
          inverted라 최신 메시지가 처음부터 바닥에 놓인다. scrollToEnd로 내리는
          방식은 가상화 때문에 아직 측정 안 된 높이까지만 이동해서 중간에 멈춘다.
          과거 메시지 페이징이 붙으면 onEndReached가 "위로 스크롤"에 대응한다. */}
      <FlatList
        inverted
        className="flex-1"
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <ChatInputBar />
    </View>
  );
}
