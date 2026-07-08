import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/shared/ui/text";
import { TABLISTS, TAB_LABELS, type TabItem } from "@/shared/config/tabList";
import { Logo } from "./Logo";
import { Link } from "expo-router";
import { lightPalette } from "@/shared/lib/theme";

interface TopNavBarProps {
  activeTab: TabItem;
  navigate: (tab: TabItem) => void;
  onPressWrite?: () => void; // "+ 기록" 버튼
  onPressNotification?: () => void; // 알림 벨
  notificationCount?: number; // 뱃지 숫자
}

export function TopNavBar({
  activeTab,
  navigate,
  onPressWrite,
  onPressNotification,
  notificationCount = 0,
}: TopNavBarProps) {
  return (
    <View className="self-center rounded-lg  w-full max-w-limit flex-row items-center justify-between shadow-dropdown px-2xl py-sm">
      {/* 왼쪽: 로고 */}
      <Link href="/" asChild>
        <Pressable>
          <Logo />
        </Pressable>
      </Link>
      {/* 오른쪽: 탭 + 액션 */}
      <View className="flex-row items-center gap-lg">
        {/* 탭 (활성 탭은 필 테두리) */}
        {TABLISTS.map((t) => {
          const active = t === activeTab;
          return (
            <Pressable
              key={t}
              onPress={() => navigate(t)}
              className={`rounded-full px-lg py-sm ${active ? "border border-secondary" : ""}`}
            >
              <Text
                variant="body"
                className={active ? "text-primary" : "text-accent"}
              >
                {TAB_LABELS[t]}
              </Text>
            </Pressable>
          );
        })}

        {/* 기록 작성 버튼 */}
        <Pressable
          onPress={onPressWrite}
          className="rounded-full bg-primary px-lg py-sm"
        >
          <Text variant="body" className="text-white">
            Upload
          </Text>
        </Pressable>

        {/* 알림 벨 + 뱃지 */}
        <Pressable onPress={onPressNotification} className="px-xs">
          <Ionicons
            name="notifications"
            size={22}
            color={lightPalette.accent}
          />
          {notificationCount > 0 && (
            <View className="absolute -right-xs -top-xs min-w-[16px] items-center justify-center rounded-full px-xs">
              <Text className="text-[10px] text-white">
                {notificationCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}
