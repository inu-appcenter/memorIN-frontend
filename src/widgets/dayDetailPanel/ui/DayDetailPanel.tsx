import { useState } from 'react';
import { Alert, Platform, ScrollView, View } from 'react-native';
import { DayDetailContent } from './DayDetailContent';
import { ReplyBar } from '@/shared/ui/replyBar';
import { useDaySlots, SLOT_LABEL } from '../model/useDaySlots';
import { useCreateComment } from '@/entities/post/model/useComments';
import type { PostSummary, TimeslotType } from '@/entities/post/api/postsApi';

interface DayDetailPanelProps {
  date: Date;
  onOpenStory: (posts: PostSummary[], startIndex: number) => void;
}

// 데스크탑 전용 — 선택된 날짜의 상세를 우측에 상시 표시.
// 댓글 입력줄은 스크롤 콘텐츠 밖(패널 하단)에 고정해서 항상 같은 위치에 보이게 한다.
export function DayDetailPanel({ date, onOpenStory }: DayDetailPanelProps) {
  const [activeSlot, setActiveSlot] = useState<TimeslotType | null>(null);
  const { postBySlot } = useDaySlots(date);

  // 클릭으로 고른 슬롯이 없거나(또는 그 슬롯 게시물이 사라졌으면) 존재하는 슬롯 중
  // 가장 나중 시간대(오후 우선)를 기본 활성 대상으로 삼는다.
  const availableSlots = postBySlot
    .filter((entry) => entry.post)
    .map((entry) => entry.slot);
  const effectiveActiveSlot =
    activeSlot && availableSlots.includes(activeSlot)
      ? activeSlot
      : (availableSlots[availableSlots.length - 1] ?? null);
  const activePost = postBySlot.find(
    (entry) => entry.slot === effectiveActiveSlot
  )?.post;
  const createComment = useCreateComment(activePost?.postId);

  const handleSubmitComment = (text: string) => {
    createComment.mutate(text, {
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : '알 수 없는 오류';
        if (Platform.OS === 'web') {
          window.alert(`댓글 작성 실패: ${message}`);
        } else {
          Alert.alert('댓글 작성 실패', message);
        }
      },
    });
  };

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
          showComments
          activeSlot={effectiveActiveSlot}
          onSelectSlot={setActiveSlot}
        />
      </ScrollView>
      {activePost && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#DADCE3',
            paddingVertical: 12,
            paddingHorizontal: 20,
          }}
        >
          <ReplyBar
            variant="light"
            placeholder={`${SLOT_LABEL[effectiveActiveSlot as TimeslotType]} 기록에 댓글 달기...`}
            onSubmit={handleSubmitComment}
            padded={false}
          />
        </View>
      )}
    </View>
  );
}
