import { Text, View } from "react-native";

interface TopNavProps {
  style?: object;
}

export const TopNav = ({ style }: TopNavProps) => {
  return (
    <View style={style}>
      <Text className="text-lg font-bold">Top Navigation</Text>
    </View>
  );
};
