import type { FC, PropsWithChildren } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui/text';

import {
  getTabLabel,
  PATH,
  SIDE_NAV_ITEMS,
  TABLISTS,
  type SideNavItem,
  type TabItem,
} from '@/shared/config/tabList';

import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';

import HomeIcon from '@/shared/assets/icons/home.svg';
import SearchIcon from '@/shared/assets/icons/search.svg';
import LogIcon from '@/shared/assets/icons/log.svg';
import ChatIcon from '@/shared/assets/icons/chat.svg';
import OptionIcon from '@/shared/assets/icons/option.svg';
import MemorINLogo from '@/shared/assets/icons/memorIN_logo.svg';
import MemorINtext from '@/shared/assets/icons/memorIN_text.svg';
import PlusIcon from '@/shared/assets/icons/plus.svg';

// tailwind.config.js의 maxWidth.limit과 같은 값. 창이 이보다 넓을 때만
// 좌우에 여백이 생기고, 그때만 컨테이너 테두리를 그린다.
const MAX_CONTENT_WIDTH = 1440;

const NAV_ICON: Record<SideNavItem, FC<SvgProps>> = {
  feed: HomeIcon,
  search: SearchIcon,
  log: LogIcon,
  chat: ChatIcon,
  settings: OptionIcon,
};

function getActiveTab(pathname: string): SideNavItem | undefined {
  return SIDE_NAV_ITEMS.find((item) => pathname.startsWith(PATH[item]));
}

function Brand({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.navigate(PATH.feed)}
      className={cn(
        'flex-row items-center gap-md',
        compact && 'justify-center'
      )}
    >
      <View className="-translate-y-[6.5px]">
        <MemorINLogo width={34} height={32} />
      </View>

      {!compact && <MemorINtext color={COLORS.brand} />}
    </Pressable>
  );
}

function UploadButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => router.navigate('/upload')}
      className={cn(
        'items-center justify-center rounded-md bg-brand',
        compact ? 'h-[52px] w-[48px]' : 'h-[46px] w-full flex-row gap-sm'
      )}
    >
      <Text className="text-[28px] leading-[28px] text-on-brand">+</Text>

      {!compact && (
        <Text className="font-sans-bold text-on-brand">
          {t('appShell.upload')}
        </Text>
      )}
    </Pressable>
  );
}

function NavItem({
  tab,
  active,
  compact,
  onPress,
}: {
  tab: SideNavItem;
  active: boolean;
  compact: boolean;
  onPress: () => void;
}) {
  const Icon = NAV_ICON[tab];

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-md rounded-md px-md py-md',
        compact && 'h-[48px] w-[48px] justify-center px-0',
        active && 'bg-brand-subtle'
      )}
    >
      <Icon
        width={22}
        height={22}
        color={active ? COLORS.brand : COLORS.tertiary}
      />

      {!compact && (
        <Text
          variant="body"
          className={active ? 'font-sans-bold text-primary' : 'text-secondary'}
        >
          {getTabLabel(tab)}
        </Text>
      )}
    </Pressable>
  );
}

function SideNav({
  compact,
  showUpload,
}: {
  compact: boolean;
  showUpload: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = getActiveTab(pathname);

  return (
    <View
      className={cn(
        'border-r border-border bg-page',
        compact ? 'w-[80px] items-center px-md py-xl' : 'w-[246px] px-lg py-xl'
      )}
    >
      <Brand compact={compact} />

      {showUpload && (
        <View className="mt-xl">
          <UploadButton compact={compact} />
        </View>
      )}

      <View className="mt-3xl gap-md">
        {SIDE_NAV_ITEMS.map((item) => (
          <NavItem
            key={item}
            tab={item}
            compact={compact}
            active={activeTab === item}
            onPress={() => router.navigate(PATH[item])}
          />
        ))}
      </View>
    </View>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = getActiveTab(pathname);

  const leftTabs = TABLISTS.slice(0, 2);
  const rightTabs = TABLISTS.slice(2);

  const renderItem = (tab: TabItem) => {
    const Icon = NAV_ICON[tab];
    const active = activeTab === tab;

    return (
      <Pressable
        key={tab}
        className="flex-1 items-center justify-center gap-xs"
        onPress={() => router.navigate(PATH[tab])}
      >
        <Icon
          width={20}
          height={20}
          color={active ? COLORS.brand : COLORS.textMuted}
        />

        <Text variant="caption" className={active ? 'text-link' : 'text-muted'}>
          {getTabLabel(tab)}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="relative h-[92px]">
      <View className="absolute inset-x-0 bottom-0 h-[68px] flex-row rounded-t-[18px] bg-page shadow-modal">
        {leftTabs.map(renderItem)}

        <View className="w-[72px]" />

        {rightTabs.map(renderItem)}
      </View>

      <Pressable
        className="absolute top-0 z-10 h-[88px] w-[88px] items-center justify-center"
        style={{ left: '50%', marginLeft: -44 }}
        onPress={() => router.navigate('/upload')}
      >
        <View className="h-[60px] w-[60px] rounded-full bg-page">
          <PlusIcon
            width={77}
            height={87}
            style={{ position: 'absolute', top: -4, left: -8 }}
          />
        </View>
      </Pressable>
    </View>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  const { device } = useBreakpoints();
  const inset = useSafeAreaInsets();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  // 업로드와 채팅 대화창은 폰에서 전체 화면으로 쓰는 계층이라 탭바를 감춘다.
  // /chat(목록)은 탭바를 유지하고 /chat/{roomId}(대화창)만 감춘다.
  const isFullScreenRoute =
    pathname.startsWith('/upload') || /^\/chat\/.+/.test(pathname);
  const isPhone = device === 'phone';
  const isClamped = width > MAX_CONTENT_WIDTH;

  // desktop/tablet/phone 사이를 오갈 때 {children}이 unmount되지 않도록,
  // 어느 device든 {children}을 감싸는 View가 같은 부모·같은 자리에 있게 만들고
  // key로 고정한다. SideNav/BottomNav는 그 안팎에서 조건부로 여닫히는 형제일 뿐이라,
  // key가 없으면 걔들이 나타나거나 사라질 때 React가 위치 기반으로 비교하다가
  // {children} 자리까지 통째로 다른 엘리먼트로 오인해서 unmount/remount해버린다.
  return (
    <View
      className="h-full flex-1 items-center bg-surface"
      style={
        isPhone
          ? {
              paddingTop: inset.top,
              paddingBottom: inset.bottom,
            }
          : undefined
      }
    >
      <View
        className={cn(
          'h-full w-full max-w-limit flex-1 flex-row bg-page',
          isClamped && 'border-x border-border'
        )}
      >
        {!isPhone && (
          <SideNav
            key="side-nav"
            compact={device === 'tablet'}
            showUpload={device === 'tablet'}
          />
        )}

        <View key="content-column" className="flex-1 overflow-hidden">
          <View key="content" className="flex-1">
            {children}
          </View>

          {isPhone && !isFullScreenRoute && <BottomNav />}
        </View>
      </View>
    </View>
  );
}
