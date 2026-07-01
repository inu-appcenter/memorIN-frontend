import { Slot, usePathname, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useBreakpoints } from "@/shared/lib/useBreakpoints";
import { TopNav } from "@/widgets/navigationBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

type TabItem = "feed" | "chat" | "profile";
const styles = StyleSheet.create({
  // 네비게이션바 스타일
  navBar: {
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export default function TabsLayout() {
  const inset = useSafeAreaInsets(); // 안전 영역
  const router = useRouter();
  const { platform } = useBreakpoints();
  const pathname = usePathname();
  const activeTab: TabItem = pathname.startsWith("/chat") // 현재 활성 탭
    ? "chat"
    : pathname.startsWith("/profile")
      ? "profile"
      : "feed"; // 기본값은 feed
  const PATH: Record<TabItem, string> = {
    feed: "/feed",
    chat: "/chat",
    profile: "/profile",
  };
  const navigate = (tab: TabItem) => router.navigate(PATH[tab]); // 네비게이션 함수

  // 로그인 안된 사용자는 인증 페이지로 리다이렉트
  // if (!currentUser) return <Redirect href={"/auth"} />;

  // 반응형 레이아웃 구성
  // 데스크탑(split view)
  if (platform === "desktop") {
    return (
      <View className="flex-1 bg-white">
        <TopNav style={[styles.navBar, { paddingTop: inset.top }]} />
        <Text className="text-center text-lg font-bold py-2">
          데스크탑 레이아웃 추가예정
        </Text>
        <Slot />
      </View>
    );
  }
  // 모바일(stack)
  if (platform === "mobile") {
    return (
      <View className="flex-1 bg-white">
        <TopNav
          style={[
            styles.navBar,
            {
              flexDirection: "column",
              alignItems: "flex-end",
              paddingTop: inset.top,
            },
          ]}
        />
        <Text className="text-center text-lg font-bold py-2">
          모바일 레이아웃 추가예정
        </Text>
        <Slot />
      </View>
    );
  }
}
