import { useState } from 'react';
import { Alert, Platform, ScrollView, View } from 'react-native';
import { DayDetailContent } from './DayDetailContent';
import { ReplyBar } from '@/shared/ui/replyBar';
import { useTranslation } from 'react-i18next';
import { useDaySlots, getSlotLabel } from '../model/useDaySlots';
import { useCreateComment } from '@/entities/post/model/useComments';
import type { PostSummary, TimeslotType } from '@/entities/post/api/postsApi';

interface DayDetailPanelProps {
  date: Date;
  onOpenStory: (posts: PostSummary[], startIndex: number) => void;
}

// 데스크탑 전용 — 선택된 날짜의 상세를 우측에 상시 표시
export function DayDetailPanel({ date, onOpenStory }: DayDetailPanelProps) {
  const [activeSlot, setActiveSlot] = useState<TimeslotType | null>(null);
  const { postBySlot } = useDaySlots(date);
  const { t } = useTranslation();

  // 클릭으로 고른 슬롯이 없거나(또는 그 슬롯 게시물이 사라졌으면) 존재하는 슬롯 중
  // 가장 나중 시간대를 기본 활성 대상으로 삼는다.
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
          error instanceof Error ? error.message : t('postEdit.unknownError');
        if (Platform.OS === 'web') {
          window.alert(t('calendarPage.commentFailMessage', { message }));
        } else {
          Alert.alert(t('calendarPage.commentFailTitle'), message);
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
            placeholder={t('calendarPage.commentPlaceholder', {
              slot: getSlotLabel(effectiveActiveSlot as TimeslotType),
            })}
            onSubmit={handleSubmitComment}
            padded={false}
          />
        </View>
      )}
    </View>
  );
}
