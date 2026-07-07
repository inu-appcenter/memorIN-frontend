import { View } from "react-native";
import { Text } from "@/shared/ui/text";

export function ChatPage() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text variant="h1" className=" text-primary">
        채팅
      </Text>
      <Text variant="h2" className=" text-secondary">
        채팅페이지
      </Text>
    </View>
  );
}
