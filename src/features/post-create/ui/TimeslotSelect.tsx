import { Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import type { TimeslotType } from '@/entities/post';

const TIMESLOT_OPTIONS: {
  value: TimeslotType;
  label: string;
  rangeLabel: string;
}[] = [
  { value: 'AM', label: '오전', rangeLabel: '24-12시' },
  { value: 'PM', label: '오후', rangeLabel: '12-24시' },
];

interface TimeslotSelectProps {
  value: TimeslotType;
  onChange: (value: TimeslotType) => void;
  disabled?: boolean;
  variant?: 'pill' | 'card'; // card: 모바일용 — 시간대 범위 서브텍스트 포함, 카드형
}

export function TimeslotSelect({
  value,
  onChange,
  disabled,
  variant = 'pill',
}: TimeslotSelectProps) {
  if (variant === 'card') {
    return (
      <View className="gap-md">
        <Text className="font-bold">시간대</Text>
        <View className="flex-row gap-sm">
          {TIMESLOT_OPTIONS.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onChange(option.value)}
                disabled={disabled}
                className={`flex-1 items-center gap-xs rounded-md border py-md ${selected ? 'border-brand bg-brand' : 'border-border bg-surface'}`}
              >
                <Text
                  className={`font-bold ${selected ? 'text-on-brand' : 'text-primary'}`}
                >
                  {option.label}
                </Text>
                <Text
                  variant="caption"
                  className={selected ? 'text-on-brand' : 'text-muted'}
                >
                  {option.rangeLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View className="gap-md">
      <Text className="font-bold">시간대</Text>
      <View className="flex-row gap-sm">
        {TIMESLOT_OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              disabled={disabled}
              className={`rounded-full border px-lg py-sm transition-opacity hover:opacity-80 ${selected ? 'border-brand bg-brand' : 'border-border bg-page'}`}
            >
              <Text className={selected ? 'text-on-brand' : 'text-secondary'}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
