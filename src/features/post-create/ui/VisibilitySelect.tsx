import { Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import type { VisibilityType } from '@/entities/post';

const VISIBILITY_OPTIONS: {
  value: VisibilityType;
  label: string;
  compactLabel: string;
}[] = [
  { value: 'PUBLIC', label: '전체', compactLabel: '전체' },
  { value: 'FRIENDS', label: '친구', compactLabel: '친구' },
  { value: 'PRIVATE', label: '나만 보기', compactLabel: '나만' },
];

interface VisibilitySelectProps {
  value: VisibilityType;
  onChange: (value: VisibilityType) => void;
  disabled?: boolean;
  compact?: boolean; // 모바일용 — '나만 보기' 대신 '나만'처럼 짧은 라벨
}

export function VisibilitySelect({
  value,
  onChange,
  disabled,
  compact = false,
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
              className={`rounded-full border px-lg py-sm transition-opacity hover:opacity-80 ${selected ? 'border-brand bg-brand' : 'border-border bg-page'}`}
            >
              <Text className={selected ? 'text-on-brand' : 'text-primary'}>
                {compact ? option.compactLabel : option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
