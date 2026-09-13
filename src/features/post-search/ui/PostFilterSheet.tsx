import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { Sheet } from '@/shared/ui/sheet';
import { cn } from '@/shared/lib/utils';
import { TagSelect } from '@/features/post-create';
import type { TagType, TimeslotType } from '@/entities/post';

const TIMESLOT_OPTIONS = [
  { value: 'AM', labelKey: 'post.timeslotAm' },
  { value: 'PM', labelKey: 'post.timeslotPm' },
] as const satisfies readonly { value: TimeslotType; labelKey: string }[];

export interface PostFilterValue {
  timeslot: TimeslotType | null;
  tags: TagType[];
}

interface PostFilterSheetProps {
  visible: boolean;
  value: PostFilterValue;
  onApply: (value: PostFilterValue) => void;
  onClose: () => void;
}

export function PostFilterSheet({
  visible,
  value,
  onApply,
  onClose,
}: PostFilterSheetProps) {
  const { t } = useTranslation();

  // 적용하기를 누르기 전까지는 바깥 상태를 건드리지 않는다.
  const [draftTimeslot, setDraftTimeslot] = useState(value.timeslot);
  const [draftTags, setDraftTags] = useState(value.tags);

  // 시트를 다시 열 때 바깥의 현재 값에서 시작한다.
  useEffect(() => {
    if (!visible) return;
    setDraftTimeslot(value.timeslot);
    setDraftTags(value.tags);
  }, [visible, value.timeslot, value.tags]);

  return (
    <Sheet visible={visible} onClose={onClose} className="h-[70%]">
      <View className="flex-1 gap-2xl p-xl">
        <Text variant="heading">{t('searchPage.filterTitle')}</Text>

        <View className="gap-md">
          <Text className="font-bold">{t('searchPage.filterTimeslot')}</Text>
          <View className="flex-row gap-sm">
            {TIMESLOT_OPTIONS.map((option) => {
              const selected = draftTimeslot === option.value;
              return (
                <Pressable
                  key={option.value}
                  // 같은 것을 다시 누르면 해제한다. 시간대를 안 고르는 상태가
                  // 기본값이라 되돌릴 방법이 필요하다.
                  onPress={() =>
                    setDraftTimeslot(selected ? null : option.value)
                  }
                  className={cn(
                    'rounded-full border px-lg py-sm transition-opacity hover:opacity-80',
                    selected ? 'border-brand bg-brand' : 'border-border bg-page'
                  )}
                >
                  <Text className={selected ? 'text-on-brand' : 'text-primary'}>
                    {t(option.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <TagSelect value={draftTags} onChange={setDraftTags} />

        <View className="mt-auto flex-row gap-md">
          <Pressable
            onPress={() => {
              setDraftTimeslot(null);
              setDraftTags([]);
            }}
            className="h-[48px] flex-1 items-center justify-center rounded-md border border-border bg-page"
          >
            <Text className="font-bold text-secondary">
              {t('searchPage.filterReset')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              onApply({ timeslot: draftTimeslot, tags: draftTags });
              onClose();
            }}
            className="h-[48px] flex-1 items-center justify-center rounded-md bg-brand"
          >
            <Text className="font-bold text-on-brand">
              {t('searchPage.filterApply')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Sheet>
  );
}
