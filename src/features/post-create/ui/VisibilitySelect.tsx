import { Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import type { VisibilityType } from '@/entities/post';

const VISIBILITY_OPTIONS: { value: VisibilityType; label: string }[] = [
  { value: 'PUBLIC', label: '전체' },
  { value: 'FRIENDS', label: '친구' },
  { value: 'PRIVATE', label: '나만 보기' },
];

interface VisibilitySelectProps {
  value: VisibilityType;
  onChange: (value: VisibilityType) => void;
  disabled?: boolean;
}

export function VisibilitySelect({
  value,
  onChange,
  disabled,
}: VisibilitySelectProps) {
  return (
    <View className="gap-md">
      <Text className="font-bold">공개 범위</Text>
      <View className="flex-row gap-sm">
        {VISIBILITY_OPTIONS.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              disabled={disabled}
              className={`rounded-full border px-lg py-sm transition-opacity hover:opacity-80 ${selected ? 'border-brand-subtle bg-brand-subtle' : 'border-border bg-page'}`}
            >
              <Text className={selected ? 'text-link' : 'text-secondary'}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
