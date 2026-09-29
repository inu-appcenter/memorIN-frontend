import { useMemo, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
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
import ChevronDownIcon from '@/shared/assets/icons/chevron-down.svg';
import DayIcon from '@/shared/assets/icons/day.svg';
import NightIcon from '@/shared/assets/icons/night.svg';

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

export function CalendarGrid({
  visibleMonth,
  selectedDate,
  onSelectDate,
  onChangeMonth,
}: CalendarGridProps) {
  const { device } = useBreakpoints();
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

  const cellGap = device === 'phone' ? 'gap-xs' : 'gap-sm';
  // 넓은 화면에서 aspect-square를 쓰면 칸 폭이 그대로 높이가 돼(1080/7 ≈ 150px)
  // 한 달이 900px을 넘긴다. 높이를 고정해 한 화면에 들어오게 한다.
  const cellSize =
    device === 'phone' ? 'aspect-square w-full' : 'h-[96px] w-full';

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

      <View className={cn('mb-sm flex-row', cellGap)}>
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

      <View className={cellGap}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} className={cn('flex-row', cellGap)}>
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
                      cellSize,
                      'items-center justify-center overflow-hidden rounded-md',
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
