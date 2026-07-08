import { Link, Slot, usePathname, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavBar } from "@/widgets/navigationBar";
import { useBreakpoints } from "@/shared/lib/useBreakpoints";
import { PATH, TABLISTS, type TabItem } from "@/shared/config/tabList";
import { TopNavBar } from "@/widgets/navigationBar/ui/TopNavBar";
import { Logo } from "@/widgets/navigationBar/ui/Logo";
import { Text } from "@/shared/ui/text";
import { act } from "react";
import { cn } from "@/shared/lib/utils";

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
    const showSideTab = activeTab !== "feed";
    return (
      <View className="flex-1">
        <TopNavBar activeTab={activeTab} navigate={navigate} />
        <View className="w-full max-w-limit flex-1 flex-row self-center">
          {/* 좌측 패널 - feed 페이지가 아닐때만 고정 */}
          {showSideTab && (
            <View className="w-[30%] items-center justify-center border-x ">
              <Text className="p-lg text-4xl text-primary">
                좌측 패널(고정)
              </Text>
            </View>
          )}
          {/* 우측 콘텐츠 — 좌측 패널이 없다면 전체 폭 */}
          <View className={cn(showSideTab ? "border-r" : "border-x", "flex-1")}>
            <Slot />
          </View>
        </View>
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
      <View className="flex-row items-center gap-xs border-b py-2">
        <Link href="/" asChild>
          <Pressable>
            <Logo />
          </Pressable>
        </Link>
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
