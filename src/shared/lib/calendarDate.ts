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

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export function formatKoreanDateHeading(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAY_LABELS[date.getDay()]}요일`;
}
