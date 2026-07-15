import { ScrollView, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';

const days = Array.from({ length: 35 }, (_, index) => index + 1);
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

function CalendarSkeleton() {
  return (
    <View className="flex-1 p-lg">
      <View className="mb-lg flex-row items-center justify-between">
        <View className="flex-row items-center gap-md">
          <Text variant="h1">기록</Text>
          <Text className="font-bold text-secondary">2026.04</Text>
        </View>
        <Text className="text-[24px]">⌄</Text>
      </View>
      <View className="mb-sm flex-row">
        {weekdays.map((day) => (
          <Text key={day} className="flex-1 text-center text-muted">
            {day}
          </Text>
        ))}
      </View>
      <View className="flex-row flex-wrap gap-sm">
        {days.map((day) => {
          const selected = day === 20;
          const hasImage = [3, 8, 14, 26].includes(day);
          return (
            <View
              key={day}
              className={`h-[68px] basis-[13%] rounded-md border p-xs ${
                selected ? 'border-brand bg-brand' : 'border-border bg-page'
              } ${hasImage ? 'border-dashed bg-surface' : ''}`}
            >
              <Text className={selected ? 'text-on-brand' : day % 7 === 0 ? 'text-error' : 'text-primary'}>
                {day}
              </Text>
              <View className="flex-1 items-end justify-end">
                <Text className={selected ? 'text-on-brand' : 'text-accent'}>{day % 6 === 0 ? '•••' : ''}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function DayDetailSkeleton() {
  return (
    <View className="w-full border-t border-border p-lg desktop:w-[380px] desktop:border-l desktop:border-t-0">
      <View className="mb-lg flex-row items-start justify-between">
        <View>
          <Text variant="h2">4월 20일 금요일</Text>
          <Text className="text-muted">아침 · 점심 · 저녁 3/3 기록 완료</Text>
        </View>
        <Text className="text-[24px]">×</Text>
      </View>
      {[['아침 08:24', '오늘 아침의 상쾌한 공기와 함께한 산책'], ['점심 12:40', '친구들과 함께한 점심 한 끼'], ['저녁 20:10', '하루를 마무리하는 저녁 노을']].map(([time, body]) => (
        <View key={time} className="mb-lg border-b border-border pb-lg">
          <View className="mb-sm h-[96px] items-center justify-center rounded-md border border-dashed border-border bg-surface">
            <Text className="text-tertiary">IMG</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-bold">{time}</Text>
            <Text className="text-link">스토리로 보기 ›</Text>
          </View>
          <Text className="mt-xs text-secondary">{body}</Text>
        </View>
      ))}
      <View className="rounded-md border border-border p-md">
        <Text>댓글 영역</Text>
      </View>
    </View>
  );
}

export function LogPage() {
  const { device } = useBreakpoints();

  return (
    <View className="flex-1 bg-page desktop:flex-row">
      <ScrollView className="flex-1">
        <CalendarSkeleton />
      </ScrollView>
      {device === 'desktop' && <DayDetailSkeleton />}
    </View>
  );
}
