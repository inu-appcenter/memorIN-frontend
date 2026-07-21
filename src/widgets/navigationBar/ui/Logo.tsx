import { View } from 'react-native';
import { Text } from '@/shared/ui/text';
import MemorinIcon from '@/shared/assets/icons/example_Icon.svg';
import { COLORS } from '@/shared/lib/theme';

export function Logo() {
  return (
    <View className="flex-row items-center gap-xs">
      <MemorinIcon width={21} height={21} color={COLORS.brand} />
      <View className="flex-row">
        <Text variant="heading" className="text-text font-bold">
          Memor
        </Text>
        <Text variant="heading" className="font-bold text-accent">
          IN
        </Text>
      </View>
    </View>
  );
}
