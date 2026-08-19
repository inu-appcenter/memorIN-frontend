import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import type { TimeslotType } from '@/entities/post';

// 라벨을 상수에 박아두면 모듈 로드 시 1회만 평가돼 언어 전환이 반영되지 않는다.
// 번역 키만 담고 렌더 시점에 t()로 변환한다.
const TIMESLOT_OPTIONS = [
  {
    value: 'AM',
    labelKey: 'post.timeslotAm',
    rangeKey: 'postCreate.timeslotAmRange',
  },
  {
    value: 'PM',
    labelKey: 'post.timeslotPm',
    rangeKey: 'postCreate.timeslotPmRange',
  },
] as const satisfies readonly {
  value: TimeslotType;
  labelKey: string;
  rangeKey: string;
}[];

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
  const { t } = useTranslation();

  if (variant === 'card') {
    return (
      <View className="gap-md">
        <Text className="font-bold">
          {t('postCreate.timeslotSectionTitle')}
        </Text>
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
                  {t(option.labelKey)}
                </Text>
                <Text
                  variant="caption"
                  className={selected ? 'text-on-brand' : 'text-muted'}
                >
                  {t(option.rangeKey)}
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
      <Text className="font-bold">{t('postCreate.timeslotSectionTitle')}</Text>
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
                {t(option.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
