import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from 'react-i18next';
import {
  buildMonthGrid,
  isSameDate,
  getWeekdayLabel,
} from '@/shared/lib/calendarDate';
import { useMonthPosts } from '../model/useMonthPosts';
import BellIcon from '@/shared/assets/icons/bell.svg';
import { showNotReady } from '@/shared/lib/showNotReady';

const WEEKDAY_INDEXES = [0, 1, 2, 3, 4, 5, 6];

interface CalendarGridProps {
  visibleMonth: Date; // 항상 해당 월 1일
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onChangeMonth: (delta: number) => void;
}

// 월간 캘린더 그리드 — 선택된 날짜와 기록이 있는 날짜를 강조 표시
export function CalendarGrid({
  visibleMonth,
  selectedDate,
  onSelectDate,
  onChangeMonth,
}: CalendarGridProps) {
  const { t } = useTranslation();
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const days = useMemo(() => buildMonthGrid(year, month), [year, month]);
  // 7일씩 주 단위로 묶어서 행(row)을 명시적으로 만든다.
  // basis-%(퍼센트) + gap을 같은 flex-wrap 행에 섞으면 좁은 너비에서
  // 간격이 100%를 넘겨 마지막 칸이 다음 줄로 밀려나는 문제가 있었다.
  const weeks = useMemo(() => {
    const rows: (typeof days)[] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  }, [days]);

  const { data: posts } = useMonthPosts(year, month);
  const recordedDates = useMemo(
    () => new Set((posts ?? []).map((post) => post.recordedDate)),
    [posts]
  );

  return (
    <View className="flex-1 p-lg">
      <View className="mb-lg flex-row items-center justify-between">
        <View className="flex-row items-center gap-md">
          <Text variant="title">{t('calendarPage.title')}</Text>
          <View className="flex-row items-center gap-sm">
            <Pressable onPress={() => onChangeMonth(-1)} hitSlop={8}>
              <Text variant="subheading" className="text-secondary">
                ‹
              </Text>
            </Pressable>
            <Text variant="body-strong" className="text-secondary">
              {year}.{String(month + 1).padStart(2, '0')}
            </Text>
            <Pressable onPress={() => onChangeMonth(1)} hitSlop={8}>
              <Text variant="subheading" className="text-secondary">
                ›
              </Text>
            </Pressable>
          </View>
        </View>
        {/* 알림 아이콘 */}
        <View className="flex-row items-center justify-between px-xl py-lg">
          <Pressable onPress={showNotReady} hitSlop={8}>
            <BellIcon width={20} height={22} />
          </Pressable>
        </View>
      </View>
      <View className="mb-sm flex-row gap-sm">
        {WEEKDAY_INDEXES.map((dayIndex) => (
          <Text
            key={dayIndex}
            variant="caption"
            className={cn(
              'flex-1 text-center text-muted',
              dayIndex === 0 && 'text-error'
            )}
          >
            {getWeekdayLabel(dayIndex)}
          </Text>
        ))}
      </View>
      <View className="gap-sm">
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row gap-sm">
            {week.map((day) => {
              const selected = isSameDate(day.date, selectedDate);
              const hasRecord = recordedDates.has(day.dateKey);
              return (
                <Pressable
                  key={day.dateKey}
                  onPress={() => onSelectDate(day.date)}
                  className={cn(
                    'h-[68px] flex-1 rounded-md border p-xs',
                    selected
                      ? 'border-brand bg-brand'
                      : 'border-border bg-page',
                    !day.isCurrentMonth && 'opacity-40'
                  )}
                >
                  <Text
                    variant="body-small"
                    className={
                      selected
                        ? 'text-on-brand'
                        : day.isSunday
                          ? 'text-error'
                          : 'text-primary'
                    }
                  >
                    {day.date.getDate()}
                  </Text>
                  <View className="flex-1 items-start justify-end">
                    {hasRecord && (
                      <Text
                        variant="caption"
                        className={selected ? 'text-on-brand' : 'text-accent'}
                      >
                        •••
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
