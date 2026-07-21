import { View } from 'react-native';
import { Text } from '@/shared/ui/text';

// 선택된 날짜의 상세 패널 — 그날의 기록(오전/오후)과 댓글 영역
export function DayDetailPanel() {
  return (
    <View className="w-full border-t border-border p-lg desktop:w-[380px] desktop:border-l desktop:border-t-0">
      <View className="mb-lg flex-row items-start justify-between">
        <View>
          <Text variant="heading">4월 20일 금요일</Text>
          <Text className="text-muted">오전 · 오후 2/2 기록 완료</Text>
        </View>
        <Text className="text-[24px]">×</Text>
      </View>
      {['오전 08:24', '오후 20:10'].map((time) => (
        <View key={time} className="mb-lg border-b border-border pb-lg">
          <View className="mb-sm h-[96px] items-center justify-center rounded-md border border-dashed border-border bg-surface">
            <Text className="text-tertiary">IMG</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-bold">{time}</Text>
            <Text className="text-link">스토리로 보기 ›</Text>
          </View>
          <Text className="mt-xs text-secondary">오늘의 순간 기록</Text>
        </View>
      ))}
      <View className="rounded-md border border-border p-md">
        <Text>댓글 영역</Text>
      </View>
    </View>
  );
}
