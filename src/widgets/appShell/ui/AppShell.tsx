import type { FC, PropsWithChildren } from 'react';
import { Pressable, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';
import { Text } from '@/shared/ui/Text';
import { PATH, TAB_LABELS, TABLISTS, type TabItem } from '@/shared/config/tabList';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import HomeIcon from '@/shared/assets/icons/home.svg';
import SearchIcon from '@/shared/assets/icons/search.svg';
import LogIcon from '@/shared/assets/icons/log.svg';
import ChatIcon from '@/shared/assets/icons/chat.svg';

const NAV_ICON: Record<TabItem, FC<SvgProps>> = {
  feed: HomeIcon,
  search: SearchIcon,
  log: LogIcon,
  chat: ChatIcon,
};

function getActiveTab(pathname: string): TabItem | undefined {
  return TABLISTS.find((tab) => pathname.startsWith(PATH[tab]));
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View className={cn('flex-row items-center gap-sm', compact && 'justify-center')}>
      <View className="h-[34px] w-[34px] items-center justify-center rounded-lg bg-brand">
        <Text className="font-sans-bold text-on-brand">m</Text>
      </View>
      {!compact && <Text className="font-sans-bold text-[24px] text-primary">MemorIN</Text>}
    </View>
  );
}

function UploadButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.navigate('/upload')}
      className={cn(
        'items-center justify-center rounded-md bg-brand',
        compact ? 'h-[52px] w-[48px]' : 'h-[46px] w-full flex-row gap-sm'
      )}
    >
      <Text className="text-[28px] leading-[28px] text-on-brand">+</Text>
      {!compact && <Text className="font-sans-bold text-on-brand">기록 올리기</Text>}
    </Pressable>
  );
}

function NavItem({ tab, active, compact, onPress }: { tab: TabItem; active: boolean; compact: boolean; onPress: () => void }) {
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
      <Icon width={22} height={22} color={active ? COLORS.brand : COLORS.tertiary} />
      {!compact && (
        <Text variant="body" className={active ? 'font-sans-bold text-primary' : 'text-secondary'}>
          {TAB_LABELS[tab]}
        </Text>
      )}
    </Pressable>
  );
}

function SideNav({ compact, showUpload }: { compact: boolean; showUpload: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = getActiveTab(pathname);

  return (
    <View className={cn('border-r border-border bg-page', compact ? 'w-[80px] items-center px-md py-xl' : 'w-[246px] px-lg py-xl')}>
      <Brand compact={compact} />
      {showUpload && (
        <View className="mt-xl">
          <UploadButton compact={compact} />
        </View>
      )}
      <View className="mt-3xl gap-md">
        {TABLISTS.map((tab) => (
          <NavItem key={tab} tab={tab} compact={compact} active={activeTab === tab} onPress={() => router.navigate(PATH[tab])} />
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
      <Pressable key={tab} className="flex-1 items-center justify-center gap-xs" onPress={() => router.navigate(PATH[tab])}>
        <Icon width={20} height={20} color={active ? COLORS.brand : COLORS.textMuted} />
        <Text variant="caption" className={active ? 'text-link' : 'text-muted'}>
          {TAB_LABELS[tab]}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="h-[68px] flex-row border-t border-border bg-page">
      {leftTabs.map(renderItem)}
      <Pressable className="w-[72px] items-center justify-center" onPress={() => router.navigate('/upload')}>
        <View className="h-[56px] w-[56px] items-center justify-center rounded-full bg-neutral-500">
          <Text className="text-[30px] leading-[30px] text-on-brand">+</Text>
        </View>
      </Pressable>
      {rightTabs.map(renderItem)}
    </View>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  const { device } = useBreakpoints();
  const inset = useSafeAreaInsets();

  if (device === 'desktop') {
    return (
      <View className="h-full flex-1 items-center bg-surface">
        <View className="h-full w-full max-w-limit flex-row bg-page">
          <SideNav compact={false} showUpload={false} />
          <View className="flex-1 overflow-hidden">{children}</View>
        </View>
      </View>
    );
  }

  if (device === 'tablet') {
    return (
      <View className="h-full flex-1 items-center bg-surface">
        <View className="h-full w-full max-w-limit flex-row bg-page">
          <SideNav compact showUpload />
          <View className="flex-1 overflow-hidden">{children}</View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-page" style={{ paddingTop: inset.top, paddingBottom: inset.bottom }}>
      <View className="flex-1 overflow-hidden">{children}</View>
      <BottomNav />
    </View>
  );
}
