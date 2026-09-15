import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarGrid } from '@/widgets/calendarGrid';
import { DayDetailSheet } from '@/widgets/dayDetailPanel';
import { StoryViewer } from '@/widgets/storyViewer';
import type { PostSummary } from '@/entities/post';

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// 캘린더 + 날짜 상세 시트 + 스토리뷰어 한 묶음.
// 시트와 뷰어는 Modal이라 부모가 ScrollView 안이어도 화면 위로 뜬다.
export function CalendarSection() {
  const router = useRouter();
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
    setSheetVisible(true);
  };

  const handleChangeMonth = (delta: number) => {
    setVisibleMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  // 스토리를 열면 아래 깔려있던 시트는 논리적으로 닫는다. 안 그러면 sheetVisible이
  // true로 남아 있다가 재마운트되는 순간 스토리뷰어 위로 불쑥 뜬다.
  const handleOpenStory = (posts: PostSummary[], startIndex: number) => {
    setStoryState({ posts, startIndex });
    setSheetVisible(false);
  };

  // 시트는 Modal이라 라우팅해도 위에 남는다. 먼저 닫고 넘어간다.
  const handleOpenPost = (postId: string) => {
    setSheetVisible(false);
    router.push(`/post/${postId}`);
  };

  return (
    <View>
      <CalendarGrid
        visibleMonth={visibleMonth}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        onChangeMonth={handleChangeMonth}
      />

      <DayDetailSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        date={selectedDate}
        onChangeDate={handleSelectDate}
        onOpenStory={handleOpenStory}
        onOpenPost={handleOpenPost}
      />

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
