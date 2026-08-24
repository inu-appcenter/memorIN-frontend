import i18next from '@/shared/lib/i18n';

export interface CalendarDay {
  date: Date;
  dateKey: string; // yyyy-MM-dd
  isCurrentMonth: boolean;
  isSunday: boolean;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isSameDate(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

// month는 0-based(Date와 동일)
export function buildMonthGrid(year: number, month: number): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0(일) ~ 6(토)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date,
      dateKey: toDateKey(date),
      isCurrentMonth: date.getMonth() === month,
      isSunday: date.getDay() === 0,
    };
  });
}

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export function getWeekdayLabel(dayIndex: number): string {
  return i18next.t(`calendar.weekday.${WEEKDAY_KEYS[dayIndex]}` as const);
}

// 한국어는 "3월 15일 화요일", 영어는 "Tue, 3/15"처럼 어순이 달라서
// 리소스의 보간 문자열에 값만 넘긴다.
export function formatDateHeading(date: Date): string {
  return i18next.t('calendar.dateHeading', {
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekday: getWeekdayLabel(date.getDay()),
  });
}
