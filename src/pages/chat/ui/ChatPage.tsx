import { View } from 'react-native';
import { Text } from '@/shared/ui/text';

const rooms = ['홍길동', '박지호', '수진', '민재', '하늘'];

export function ChatPage() {
  return (
    <View className="flex-1 flex-row bg-page">
      <View className="w-full border-r border-border tablet:w-[320px]">
        <View className="h-[62px] flex-row items-center justify-between border-b border-border px-lg">
          <Text variant="h1">채팅</Text>
          <Text className="text-[24px]">⌕</Text>
        </View>
        {rooms.map((name, index) => (
          <View
            key={name}
            className={`h-[70px] flex-row items-center gap-md border-b border-border px-lg ${
              index === 0 ? 'bg-brand-subtle' : 'bg-page'
            }`}
          >
            <View className="h-[44px] w-[44px] rounded-full bg-subtle" />
            <View className="flex-1">
              <Text className="font-bold">{name}</Text>
              <Text className="text-muted">{index === 0 ? '내일 시간 괜찮아?' : '기록 잘 봤어 :)'}</Text>
            </View>
            <Text className="text-muted">{index === 0 ? '오후 2:14' : '어제'}</Text>
          </View>
        ))}
      </View>
      <View className="hidden flex-1 bg-surface tablet:flex">
        <View className="h-[66px] flex-row items-center justify-between border-b border-border bg-page px-xl">
          <View className="flex-row items-center gap-md">
            <View className="h-[38px] w-[38px] rounded-full bg-subtle" />
            <Text className="font-bold">홍길동</Text>
          </View>
          <Text className="text-[22px]">•••</Text>
        </View>
        <View className="flex-1 gap-lg p-xl">
          <View className="self-start rounded-lg border border-border bg-page px-md py-sm">
            <Text>안녕! 내일 시간 괜찮아?</Text>
          </View>
          <View className="self-end rounded-lg bg-brand px-md py-sm">
            <Text className="text-on-brand">응 오후엔 괜찮아</Text>
          </View>
          <View className="self-start rounded-lg border border-border bg-page px-md py-sm">
            <Text>그럼 카페에서 볼까?</Text>
          </View>
        </View>
        <View className="h-[76px] flex-row items-center gap-md border-t border-border bg-page px-xl">
          <View className="h-[44px] flex-1 justify-center rounded-full bg-surface px-lg">
            <Text className="text-muted">메시지 입력...</Text>
          </View>
          <Text className="text-[28px] text-link">↗</Text>
        </View>
      </View>
    </View>
  );
}
