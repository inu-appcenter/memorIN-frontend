import { Slot, usePathname, useRouter } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavBar } from "@/widgets/navigationBar";
import { useBreakpoints } from "@/shared/lib/useBreakpoints";
import { PATH, TABLISTS, type TabItem } from "@/shared/config/tabList";
import { TopNavBar } from "@/widgets/navigationBar/ui/TopNavBar";
import { Logo } from "@/widgets/navigationBar/ui/Logo";

export default function TabsLayout() {
  const inset = useSafeAreaInsets(); // 안전 영역(모바일 고려)
  const router = useRouter();
  const { device } = useBreakpoints();
  const pathname = usePathname();

  // 현재 경로에 매칭되는 탭, 없으면 feed
  const activeTab: TabItem =
    TABLISTS.find((t) => pathname.startsWith(PATH[t])) ?? "feed";

  const navigate = (tab: TabItem) => router.navigate(PATH[tab]); // 네비게이션 함수

  // 로그인 안된 사용자는 인증 페이지로 리다이렉트
  // if (!currentUser) return <Redirect href={"/auth/sing-in"} />;

  // 데스크탑(split view)
  if (device === "desktop") {
    return (
      <View className="flex-1">
        <TopNavBar activeTab={activeTab} navigate={navigate} />
        <Slot />
      </View>
    );
  }

  // 모바일(stack)
  return (
    <View
      className="flex-1"
      style={{ paddingTop: inset.top, paddingBottom: inset.bottom }} // inset은 동적 값이라 style에 설정
    >
      {/* 화면 상단 레이아웃 구성 */}
      <View className="flex-row items-center gap-s4 border-b py-2">
        <Logo />
      </View>
      <View className="flex-1">
        <Slot />
      </View>
      {/* 화면 하단 레이아웃 구성 */}
      <NavBar
        className="border-t border-secondary"
        navigate={navigate}
        activeTab={activeTab}
      />
    </View>
  );
}
