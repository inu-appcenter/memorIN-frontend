import { View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import { TABLISTS, TAB_LABELS, type TabItem } from '@/shared/config/tabList';
import { Logo } from './Logo';
import BellIcon from '@/shared/assets/icons/example_bell.svg';

type TopNavBarProps = {
  onPressWrite?: () => void;
  onPressNotification?: () => void;
  notificationCount?: number;
  className?: string;
} & (
  | { activeTab: TabItem; navigate: (tab: TabItem) => void }
  | { activeTab?: undefined; navigate?: undefined }
);

export function TopNavBar({
  activeTab,
  navigate,
  onPressWrite,
  onPressNotification,
  notificationCount = 0,
  className,
}: TopNavBarProps) {
  const showTabs = activeTab !== undefined && navigate !== undefined;

  return (
    <View
      className={cn(
        'w-full max-w-limit flex-row items-center justify-between self-center rounded-lg px-lg py-lg shadow-dropdown',
        className
      )}
    >
      <Link href="/" asChild>
        <Pressable>
          <Logo />
        </Pressable>
      </Link>

      <View className="flex-row items-center gap-lg">
        {showTabs &&
          TABLISTS.map((t) => {
            const active = t === activeTab;
            return (
              <Pressable
                key={t}
                onPress={() => navigate(t)}
                className={cn(
                  'rounded-full px-lg py-sm',
                  active && 'border border-strong'
                )}
              >
                <Text
                  variant="body"
                  className={active ? 'text-primary' : 'text-muted'}
                >
                  {TAB_LABELS[t]}
                </Text>
              </Pressable>
            );
          })}

        <Pressable onPress={onPressNotification} className="px-xs">
          <BellIcon width={22} height={22} color={COLORS.brand} />
          {notificationCount > 0 && (
            <View className="absolute -right-xs -top-xs min-w-[16px] items-center justify-center rounded-full px-xs">
              <Text className="text-[10px] text-on-brand">
                {notificationCount}
              </Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={onPressWrite}
          className="rounded-full bg-brand px-lg py-sm active:bg-brand-press"
        >
          <Text variant="body" className="text-on-brand">
            + 기록
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
