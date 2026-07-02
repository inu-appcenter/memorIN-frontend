import { View } from "react-native";
import { Text } from "@/shared/ui/Text";

export default function Page() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text variant="h1" className=" text-primary">
        루트페이지
      </Text>
    </View>
  );
}
