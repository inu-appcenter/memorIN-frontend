import { View } from "react-native";
import { Text } from "@/shared/ui/Text";

export function FeedPage() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text variant="h1" className=" text-primary">
        피드
      </Text>
      <Text variant="h2" className=" text-secondary">
        피드페이지
      </Text>
    </View>
  );
}
