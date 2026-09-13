import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import DayIcon from '@/shared/assets/icons/day.svg';
import NightIcon from '@/shared/assets/icons/night.svg';
import type { TimeslotType } from '@/entities/post';

// 라벨을 상수에 박아두면 모듈 로드 시 1회만 평가돼 언어 전환이 반영되지 않는다.
// 번역 키만 담고 렌더 시점에 t()로 변환한다.
const TIMESLOT_OPTIONS = [
  {
    value: 'AM',
    labelKey: 'post.timeslotAm',
    Icon: DayIcon,
    iconColor: COLORS.accent,
  },
  {
    value: 'PM',
    labelKey: 'post.timeslotPm',
    Icon: NightIcon,
    iconColor: COLORS.brand,
  },
] as const satisfies readonly {
  value: TimeslotType;
  labelKey: string;
  Icon: typeof DayIcon;
  iconColor: string;
}[];

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
  const { t } = useTranslation();

  return (
    <View className="flex-row rounded-md bg-subtle p-xs">
      {TIMESLOT_OPTIONS.map((option) => {
        const selected = option.value === value;
        const { Icon } = option;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              'flex-1 flex-row items-center justify-center gap-xs rounded-md py-md',
              selected && 'bg-page shadow-card'
            )}
          >
            <Icon
              width={16}
              height={16}
              color={selected ? option.iconColor : COLORS.textMuted}
            />
            <Text
              className={selected ? 'font-bold text-primary' : 'text-muted'}
            >
              {t(option.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
