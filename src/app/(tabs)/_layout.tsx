import { Slot, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavBar } from '@/widgets/navigationBar';
import { TopNavBar } from '@/widgets/navigationBar/ui/TopNavBar';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { PATH, TABLISTS, type TabItem } from '@/shared/config/tabList';
import { Text } from '@/shared/ui/text';


export default function TabsLayout() {
  const inset = useSafeAreaInsets(); // 안전 영역(모바일 고려)
  const router = useRouter();
  const { device } = useBreakpoints();
  const pathname = usePathname();

  // 현재 경로에 매칭되는 탭, 없으면 feed
  const activeTab: TabItem =
    TABLISTS.find((t) => pathname.startsWith(PATH[t])) ?? 'feed';

  const navigate = (tab: TabItem) => router.navigate(PATH[tab]);

  // 로그인 안된 사용자는 인증 페이지로 리다이렉트
  // if (!currentUser) return <Redirect href={"/auth/sign-in"} />;

  // 데스크탑(split view)
  if (device === 'desktop') {
    const showSideTab = activeTab !== 'feed';
    return (
      <View className="flex-1 gap-sm p-lg">
        {/* 탭 props 쌍을 넘김 → 탭 렌더 */}
        <TopNavBar activeTab={activeTab} navigate={navigate} />
        <View className="w-full max-w-limit flex-1 flex-row gap-sm self-center">
          {showSideTab && (
            <View className="w-[30%] items-center justify-center rounded-lg shadow-dropdown">
              <Text className="p-lg text-4xl text-primary">
                좌측 패널(고정)
              </Text>
            </View>
          )}
          <View className="flex-1 rounded-lg shadow-dropdown">
            <Slot />
          </View>
        </View>
      </View>
    );
  }

  // 모바일(stack)
  return (
    <View
      className="flex-1 bg-page"
      style={{ paddingTop: inset.top, paddingBottom: inset.bottom }}
    >
      {/* 탭 props 생략 → 로고 | Upload + 벨 (between) */}
      <TopNavBar className="rounded-none border-b shadow-none" />
      <View className="flex-1">
        <Slot />
      </View>
      <NavBar className="border-t" navigate={navigate} activeTab={activeTab} />
    </View>
  );
}
