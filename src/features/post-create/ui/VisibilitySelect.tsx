import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import type { VisibilityType } from '@/entities/post';

// 라벨은 키만 담고 렌더 시점에 t()로 변환한다 (TimeslotSelect와 동일한 이유).
const VISIBILITY_OPTIONS = [
  {
    value: 'PUBLIC',
    labelKey: 'postCreate.visibilityPublic',
    compactKey: 'postCreate.visibilityPublic',
  },
  {
    value: 'FRIENDS',
    labelKey: 'postCreate.visibilityFriends',
    compactKey: 'postCreate.visibilityFriends',
  },
  {
    value: 'PRIVATE',
    labelKey: 'postCreate.visibilityPrivate',
    compactKey: 'postCreate.visibilityPrivateCompact',
  },
] as const satisfies readonly {
  value: VisibilityType;
  labelKey: string;
  compactKey: string;
}[];

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
  const { t } = useTranslation();

  return (
    <View className="gap-md">
      <Text className="font-bold">
        {t('postCreate.visibilitySectionTitle')}
      </Text>
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
                {t(compact ? option.compactKey : option.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
