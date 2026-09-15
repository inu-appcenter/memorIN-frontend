import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import type { TagType } from '@/entities/post';
import { TAG_LABEL_KEY } from '@/entities/post/model/postContent';

// 백엔드 TagType enum과 순서까지 같다.
const TAG_OPTIONS = [
  'STUDY',
  'GAME',
  'ANIMAL',
  'TRAVEL',
  'EXERCISE',
  'FOOD',
  'MUSIC',
  'DAILY',
  'HOBBY',
  'ETC',
] as const satisfies readonly TagType[];

// PostCreateRequest의 @Size(max = 3), PostController.search의 검사와 같은 값이다.
export const MAX_TAGS = 3;

interface TagSelectProps {
  value: TagType[];
  onChange: (value: TagType[]) => void;
  disabled?: boolean;
}

export function TagSelect({ value, onChange, disabled }: TagSelectProps) {
  const { t } = useTranslation();
  const isFull = value.length >= MAX_TAGS;

  const toggle = (tag: TagType) => {
    if (value.includes(tag)) {
      onChange(value.filter((selected) => selected !== tag));
      return;
    }
    if (isFull) return;
    onChange([...value, tag]);
  };

  return (
    <View className="gap-md">
      <View className="flex-row items-baseline gap-sm">
        <Text className="font-bold">{t('postCreate.tagSectionTitle')}</Text>
        <Text variant="label" className="text-muted">
          {t('postCreate.tagSectionMax', { max: MAX_TAGS })}
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-sm">
        {TAG_OPTIONS.map((tag) => {
          const selected = value.includes(tag);
          // 이미 3개를 골랐으면 고르지 않은 것들은 누를 수 없다.
          const unavailable = !selected && isFull;

          return (
            <Pressable
              key={tag}
              onPress={() => toggle(tag)}
              disabled={disabled || unavailable}
              className={cn(
                'rounded-full border px-lg py-sm transition-opacity hover:opacity-80',
                selected ? 'border-brand bg-brand' : 'border-border bg-page',
                unavailable && 'opacity-40'
              )}
            >
              <Text className={selected ? 'text-on-brand' : 'text-primary'}>
                {t(TAG_LABEL_KEY[tag])}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
