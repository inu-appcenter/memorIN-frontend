import { View } from "react-native";
import { Text } from "@/shared/ui/text";

// 추후 이미지로 교체 예정
export function Logo() {
  return (
    <View className="flex-row items-center gap-xs">
      <View className="h-2xl w-2xl items-center justify-center rounded-full bg-accent">
        <Text className="font-bold  text-text">M</Text>
      </View>
      <View className="flex-row ">
        <Text variant="h3" className="font-bold text-text">
          Memor
        </Text>
        <Text variant="h3" className="font-bold text-accent">
          IN
        </Text>
      </View>
    </View>
  );
}
