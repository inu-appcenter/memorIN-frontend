import { View } from "react-native";
import { Text } from "@/shared/ui/text";

// 추후 이미지로 교체 예정
export function Logo() {
  return (
    <View className="flex-row items-center gap-s4">
      <View className="h-s24 w-s24 items-center justify-center rounded-pill bg-primary">
        <Text className="font-bold text-text">M</Text>
      </View>
      <Text variant="h3" className="font-bold text-text">
        memorIN
      </Text>
    </View>
  );
}
