import { Pressable, View } from 'react-native';
import { Sheet } from '@/shared/ui/sheet';
import { REACTION_ICONS, REACTION_TYPES } from '../model/reactionIcons';
import type { ReactionType } from '../model/types';

interface ReactionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: ReactionType) => void;
}

// 이모지 6종 선택 UI. 지금은 데스크톱/모바일 둘 다 기존 Sheet를 재사용
export function ReactionPicker({
  visible,
  onClose,
  onSelect,
}: ReactionPickerProps) {
  return (
    <Sheet visible={visible} onClose={onClose} className="items-center">
      <View className="flex-row gap-lg py-md">
        {REACTION_TYPES.map((type) => {
          const Icon = REACTION_ICONS[type];
          return (
            <Pressable
              key={type}
              onPress={() => {
                onSelect(type);
                onClose();
              }}
              hitSlop={8}
            >
              <Icon width={32} height={32} />
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
