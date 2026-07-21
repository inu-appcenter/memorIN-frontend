import { View } from 'react-native';
import { Text } from '@/shared/ui/text';

const days = Array.from({ length: 35 }, (_, index) => index + 1);
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

// 월간 캘린더 그리드 — 선택된 날짜(20일)와 기록이 있는 날짜를 강조 표시
export function CalendarGrid() {
  return (
    <View className="flex-1 p-lg">
      <View className="mb-lg flex-row items-center justify-between">
        <View className="flex-row items-center gap-md">
          <Text variant="title">기록</Text>
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
              className={`h-[68px] basis-[13%] rounded-md border p-xs ${selected ? 'border-brand bg-brand' : 'border-border bg-page'} ${hasImage ? 'border-dashed bg-surface' : ''}`}
            >
              <Text
                className={
                  selected
                    ? 'text-on-brand'
                    : day % 7 === 0
                      ? 'text-error'
                      : 'text-primary'
                }
              >
                {day}
              </Text>
              <View className="flex-1 items-end justify-end">
                <Text className={selected ? 'text-on-brand' : 'text-accent'}>
                  {day % 6 === 0 ? '•••' : ''}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
