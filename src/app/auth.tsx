import { Text, View } from "react-native";

export default function AuthRoute() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-800">로그인</Text>
      <Text className="text-sm text-gray-500">로그인페이지</Text>
    </View>
  );
}
