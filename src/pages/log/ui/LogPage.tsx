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
  // 3단계(스토리 뷰어)에서 이 상태로 모달을 띄운다.
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

  const handleOpenStory = (posts: PostSummary[], startIndex: number) => {
    setStoryState({ posts, startIndex });
  };

  return (
    <View className="flex-1 bg-page desktop:flex-row">
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
