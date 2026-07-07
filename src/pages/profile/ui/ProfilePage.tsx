import { View } from "react-native";
import { Text } from "@/shared/ui/text";

export function ProfilePage() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text variant="h1" className=" text-primary">
        프로필
      </Text>
      <Text variant="h2" className=" text-secondary">
        프로필페이지
      </Text>
    </View>
  );
}
