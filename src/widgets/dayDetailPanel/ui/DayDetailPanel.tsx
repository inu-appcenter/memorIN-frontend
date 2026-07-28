import { ScrollView, View } from 'react-native';
import { DayDetailContent } from './DayDetailContent';
import type { PostSummary } from '@/entities/post/api/postsApi';

interface DayDetailPanelProps {
  date: Date;
  onOpenStory: (posts: PostSummary[], startIndex: number) => void;
}

// 데스크탑 전용 — 선택된 날짜의 상세를 우측에 상시 표시
export function DayDetailPanel({ date, onOpenStory }: DayDetailPanelProps) {
  return (
    <View className="w-[380px] border-l border-border">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <DayDetailContent
          date={date}
          onOpenStory={onOpenStory}
          showEngagement
        />
      </ScrollView>
    </View>
  );
}
