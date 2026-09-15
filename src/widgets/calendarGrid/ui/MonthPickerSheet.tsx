import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { Sheet } from '@/shared/ui/sheet';
import { cn } from '@/shared/lib/utils';

const MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

interface MonthPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  visibleMonth: Date; // 항상 해당 월 1일
  onPick: (year: number, month: number) => void;
}

// 헤더의 2026.01 ⌄를 눌렀을 때 뜨는 월 선택. 연도는 좌우 화살표로 옮긴다.
export function MonthPickerSheet({
  visible,
  onClose,
  visibleMonth,
  onPick,
}: MonthPickerSheetProps) {
  const { t } = useTranslation();
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="gap-lg px-2xl py-lg">
        <View className="flex-row items-center justify-center gap-2xl">
          <Pressable onPress={() => onPick(year - 1, month)} hitSlop={8}>
            <Text variant="subheading" className="text-secondary">
              ‹
            </Text>
          </Pressable>
          <Text variant="heading">{year}</Text>
          <Pressable onPress={() => onPick(year + 1, month)} hitSlop={8}>
            <Text variant="subheading" className="text-secondary">
              ›
            </Text>
          </Pressable>
        </View>

        <View className="flex-row flex-wrap">
          {MONTHS.map((value) => {
            const selected = value === month;
            return (
              <View key={value} className="w-1/4 p-xs">
                <Pressable
                  onPress={() => {
                    onPick(year, value);
                    onClose();
                  }}
                  className={cn(
                    'h-[44px] items-center justify-center rounded-md',
                    selected ? 'bg-brand' : 'bg-surface'
                  )}
                >
                  <Text
                    className={
                      selected ? 'font-bold text-on-brand' : 'text-primary'
                    }
                  >
                    {t('calendar.monthOption', { month: value + 1 })}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    </Sheet>
  );
}
