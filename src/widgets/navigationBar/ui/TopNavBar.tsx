import { View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import { TABLISTS, TAB_LABELS, type TabItem } from '@/shared/config/tabList';
import { Logo } from './Logo';
import BellIcon from '@/shared/assets/icons/example_bell.svg';

// ??props???�으로만: ????주면 ???�더(?�스?�탑), ?????�으�?미렌??모바??
type TopNavBarProps = {
  onPressWrite?: () => void; // 미구??
  onPressNotification?: () => void; // 미구??
  notificationCount?: number;
  className?: string; // ?�이 컨테?�너 ?��???조정??
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
      {/* ?�쪽: 로고 (??링크) */}
      <Link href="/" asChild>
        <Pressable>
          <Logo />
        </Pressable>
      </Link>

      {/* ?�른�? (?? + ?�션 */}
      <View className="flex-row items-center gap-lg">
        {/* ?????�스?�탑?�서�?(props ?�이 ?�을 ?? */}
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

        {/* �??�이�?+ 뱃�? */}
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

        {/* 기록 ?�성 버튼 */}
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
