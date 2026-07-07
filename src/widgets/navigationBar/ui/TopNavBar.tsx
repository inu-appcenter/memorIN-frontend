import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/shared/ui/text";
import { TABLISTS, TAB_LABELS, type TabItem } from "@/shared/config/tabList";
import { Logo } from "./Logo";

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
    <View className="flex-row items-center justify-between border-b bg-background px-s24 py-s12">
      {/* 왼쪽: 로고 */}
      <Logo />
      {/* 오른쪽: 탭 + 액션 */}
      <View className="flex-row items-center gap-s16">
        {/* 탭 (활성 탭은 필 테두리) */}
        {TABLISTS.map((t) => {
          const active = t === activeTab;
          return (
            <Pressable
              key={t}
              onPress={() => navigate(t)}
              className={`rounded-pill px-s16 py-s8 ${active ? "border border-secondary" : ""}`}
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
          className="rounded-pill bg-primary px-s16 py-s8"
        >
          <Text variant="body" className="text-secondary">
            Upload
          </Text>
        </Pressable>

        {/* 알림 벨 + 뱃지 */}
        <Pressable onPress={onPressNotification} className="px-s4">
          <Ionicons name="notifications" size={22} color="#fcf7d6" />
          {notificationCount > 0 && (
            <View className="absolute -right-s4 -top-s4 min-w-[16px] items-center justify-center rounded-pill px-s4">
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
