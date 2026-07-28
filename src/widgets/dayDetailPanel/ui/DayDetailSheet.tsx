import { ScrollView } from 'react-native';
import { Sheet } from '@/shared/ui/sheet';
import { DayDetailContent } from './DayDetailContent';
import type { PostSummary } from '@/entities/post/api/postsApi';

interface DayDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  date: Date;
  onOpenStory: (posts: PostSummary[], startIndex: number) => void;
}

// 테블릿/폰 전용 — 캘린더 셀 선택 시 바텀시트로 날짜 상세 표시
export function DayDetailSheet({
  visible,
  onClose,
  date,
  onOpenStory,
}: DayDetailSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <DayDetailContent date={date} onOpenStory={onOpenStory} />
      </ScrollView>
    </Sheet>
  );
}
