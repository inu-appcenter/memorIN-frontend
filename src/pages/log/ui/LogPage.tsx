import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { CalendarGrid } from '@/widgets/calendarGrid';
import { DayDetailPanel, DayDetailSheet } from '@/widgets/dayDetailPanel';
import type { PostSummary } from '@/entities/post/api/postsApi';
import { StoryViewer } from '@/widgets/storyViewer';

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function LogPage() {
  const { device } = useBreakpoints();
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(new Date())
  );
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [sheetVisible, setSheetVisible] = useState(false);
  const [storyState, setStoryState] = useState<{
    posts: PostSummary[];
    startIndex: number;
  } | null>(null);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    if (
      date.getMonth() !== visibleMonth.getMonth() ||
      date.getFullYear() !== visibleMonth.getFullYear()
    ) {
      setVisibleMonth(startOfMonth(date));
    }
    if (device !== 'desktop') {
      setSheetVisible(true);
    }
  };

  const handleChangeMonth = (delta: number) => {
    setVisibleMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  // 스토리를 열면 아래 깔려있던 날짜 상세 시트는 논리적으로 닫아야 한다 — 안
  // 그러면 sheetVisible=true 상태가 그대로 남아있다가, desktop↔tablet을 오가며
  // DayDetailSheet가 다시 마운트되는 순간 스토리뷰어 위로 시트가 불쑥 뜬다.
  const handleOpenStory = (posts: PostSummary[], startIndex: number) => {
    setStoryState({ posts, startIndex });
    setSheetVisible(false);
  };

  return (
    <View className="flex-1 bg-page">
      {/* 데스크탑은 달력과 날짜 상세 패널이 좌우로 놓인다 */}
      <View className="flex-1 desktop:flex-row">
        <ScrollView className="flex-1">
          <CalendarGrid
            visibleMonth={visibleMonth}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onChangeMonth={handleChangeMonth}
          />
        </ScrollView>

        {device === 'desktop' && (
          <DayDetailPanel date={selectedDate} onOpenStory={handleOpenStory} />
        )}
      </View>

      {device !== 'desktop' && (
        <DayDetailSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          date={selectedDate}
          onOpenStory={handleOpenStory}
        />
      )}

      {storyState && (
        <StoryViewer
          posts={storyState.posts}
          startIndex={storyState.startIndex}
          onClose={() => setStoryState(null)}
        />
      )}
    </View>
  );
}
