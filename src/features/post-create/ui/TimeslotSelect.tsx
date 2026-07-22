import { Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import type { TimeslotType } from '@/entities/post';

const TIMESLOT_OPTIONS: { value: TimeslotType; label: string }[] = [
  { value: 'AM', label: '오전' },
  { value: 'PM', label: '오후' },
];

interface TimeslotSelectProps {
  value: TimeslotType;
  onChange: (value: TimeslotType) => void;
  disabled?: boolean;
}

export function TimeslotSelect({
  value,
  onChange,
  disabled,
}: TimeslotSelectProps) {
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
