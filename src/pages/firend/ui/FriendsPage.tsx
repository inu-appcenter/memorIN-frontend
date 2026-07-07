import { View } from "react-native";
import { Text } from "@/shared/ui/text";

export function FriendsPage() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text variant="h1" className=" text-primary">
        친구
      </Text>
      <Text variant="h2" className=" text-secondary">
        친구페이지
      </Text>
    </View>
  );
}
