import { View } from "react-native";
import { Text } from "@/shared/ui/Text";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import { TABLISTS, TAB_LABELS, type TabItem } from "@/shared/config/tabList";

interface NavBarProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
  navigate: (tab: TabItem) => void;
  activeTab: TabItem;
}

export const NavBar = ({
  className,
  style,
  navigate,
  activeTab,
}: NavBarProps) => {
  return (
    <View className={`flex-row ${className ?? ""}`} style={style}>
      {TABLISTS.map((t) => (
        <Pressable
          key={t}
          className="flex-1 items-center py-3"
          onPress={() => navigate(t)}
        >
          <Text
            className={`font-semibold ${activeTab === t ? "text-primary" : "text-secondary"}`}
          >
            {TAB_LABELS[t]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};
