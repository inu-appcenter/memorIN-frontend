import { useMemo, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import {
  buildMonthGrid,
  isSameDate,
  getWeekdayLabel,
} from '@/shared/lib/calendarDate';
import { resolveMediaUrl } from '@/entities/post/lib/resolveMediaUrl';
import { PostVideoThumbnail } from '@/entities/post/ui/PostVideoThumbnail';
import type { PostSummary, TimeslotType } from '@/entities/post/api/postsApi';
import { useMonthPosts } from '../model/useMonthPosts';
import { MonthPickerSheet } from './MonthPickerSheet';
import BellIcon from '@/shared/assets/icons/bell.svg';
import ChevronDownIcon from '@/shared/assets/icons/chevron-down.svg';
import DayIcon from '@/shared/assets/icons/day.svg';
import NightIcon from '@/shared/assets/icons/night.svg';
import { showNotReady } from '@/shared/lib/showNotReady';

const WEEKDAY_INDEXES = [0, 1, 2, 3, 4, 5, 6];

const SWITCH_WIDTH = 52;
const SWITCH_HEIGHT = 28;
const SWITCH_KNOB_SIZE = 22;
const SWITCH_KNOB_INSET = 3;

interface CalendarGridProps {
  visibleMonth: Date; // 항상 해당 월 1일
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onChangeMonth: (delta: number) => void;
}

// 오전은 노랑·해, 오후는 파랑·달. 노브는 오후일 때 오른쪽으로 간다.
// 시안과 방향이 반대면 isKnobRight 한 줄만 뒤집으면 된다.
function TimeslotSwitch({
  value,
  onChange,
}: {
  value: TimeslotType;
  onChange: (value: TimeslotType) => void;
}) {
  const isAm = value === 'AM';
  const isKnobRight = !isAm;
  const Icon = isAm ? DayIcon : NightIcon;
  const trackColor = isAm ? COLORS.accent : COLORS.brand;

  return (
    <Pressable
      onPress={() => onChange(isAm ? 'PM' : 'AM')}
      hitSlop={8}
      style={{
        width: SWITCH_WIDTH,
        height: SWITCH_HEIGHT,
        borderRadius: SWITCH_HEIGHT / 2,
        backgroundColor: trackColor,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: SWITCH_KNOB_INSET,
          left: isKnobRight
            ? SWITCH_WIDTH - SWITCH_KNOB_SIZE - SWITCH_KNOB_INSET
            : SWITCH_KNOB_INSET,
          width: SWITCH_KNOB_SIZE,
          height: SWITCH_KNOB_SIZE,
          borderRadius: SWITCH_KNOB_SIZE / 2,
          backgroundColor: COLORS.white,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon width={14} height={14} color={trackColor} />
      </View>
    </Pressable>
  );
}

// 폰 시안 — 셀 테두리를 없애고 기록이 있는 날은 썸네일이 칸을 꽉 채운다.
// 미디어 없이 글만 있는 기록은 짙은 사각형으로, 빈 날은 숫자만 남는다.
function PhoneCalendarGrid({
  visibleMonth,
  selectedDate,
  onSelectDate,
  onChangeMonth,
}: CalendarGridProps) {
  const { t } = useTranslation();
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const [timeslot, setTimeslot] = useState<TimeslotType>('AM');
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

  const days = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const weeks = useMemo(() => {
    const rows: (typeof days)[] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  }, [days]);

  const { data: posts } = useMonthPosts(year, month);
  // 스위치가 고른 시간대의 기록만 셀에 그린다. 같은 날 오전·오후가 다 있어도
  // 칸은 하나뿐이라 둘을 겹쳐 보여줄 수 없다.
  const postByDate = useMemo(() => {
    const map = new Map<string, PostSummary>();
    for (const post of posts ?? []) {
      if (post.timeslot !== timeslot) continue;
      if (!map.has(post.recordedDate)) map.set(post.recordedDate, post);
    }
    return map;
  }, [posts, timeslot]);

  const handlePickMonth = (nextYear: number, nextMonth: number) => {
    onChangeMonth((nextYear - year) * 12 + (nextMonth - month));
  };

  return (
    <View className="p-lg">
      <View className="mb-lg flex-row items-center justify-between">
        <Pressable
          onPress={() => setMonthPickerVisible(true)}
          hitSlop={8}
          className="flex-row items-center gap-xs"
        >
          <Text variant="title" className="font-bold text-primary">
            {year}.{String(month + 1).padStart(2, '0')}
          </Text>
          <ChevronDownIcon width={18} height={18} color={COLORS.text} />
        </Pressable>

        <TimeslotSwitch value={timeslot} onChange={setTimeslot} />
      </View>

      <View className="mb-sm flex-row gap-xs">
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

      <View className="gap-xs">
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className="flex-row gap-xs">
            {week.map((day) => {
              const selected = isSameDate(day.date, selectedDate);
              const post = postByDate.get(day.dateKey);
              const attachment = post?.attachments[0];
              const mediaUrl = attachment
                ? resolveMediaUrl(attachment)
                : undefined;
              const isVideo =
                attachment?.contentType.startsWith('video/') ?? false;
              const dayNumber = day.date.getDate();

              return (
                <Pressable
                  key={day.dateKey}
                  onPress={() => onSelectDate(day.date)}
                  className="flex-1"
                >
                  <View
                    className={cn(
                      'aspect-square w-full items-center justify-center overflow-hidden rounded-md',
                      selected && 'border-2 border-brand'
                    )}
                  >
                    {mediaUrl && isVideo ? (
                      <PostVideoThumbnail
                        uri={mediaUrl}
                        style={{ height: '100%', width: '100%' }}
                      />
                    ) : mediaUrl ? (
                      <Image
                        source={{ uri: mediaUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : post ? (
                      <View
                        className="h-full w-full items-center justify-center"
                        style={{ backgroundColor: COLORS.recordTextOnly }}
                      >
                        <Text variant="body-small" className="text-on-brand">
                          {dayNumber}
                        </Text>
                      </View>
                    ) : (
                      <Text
                        variant="body-small"
                        className={cn(
                          !day.isCurrentMonth
                            ? 'text-muted'
                            : day.isSunday
                              ? 'text-error'
                              : 'text-primary'
                        )}
                      >
                        {dayNumber}
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <MonthPickerSheet
        visible={monthPickerVisible}
        onClose={() => setMonthPickerVisible(false)}
        visibleMonth={visibleMonth}
        onPick={handlePickMonth}
      />
    </View>
  );
}

// 테블릿·데스크탑 — 해당 시안이 나오기 전까지 기존 모습을 유지한다.
function WideCalendarGrid({
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

export function CalendarGrid(props: CalendarGridProps) {
  const { device } = useBreakpoints();
  return device === 'phone' ? (
    <PhoneCalendarGrid {...props} />
  ) : (
    <WideCalendarGrid {...props} />
  );
}
