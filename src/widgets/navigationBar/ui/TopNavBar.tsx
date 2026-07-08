import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import { TABLISTS, TAB_LABELS, type TabItem } from '@/shared/config/tabList';
import { Logo } from './Logo';
import BellIcon from '@/shared/assets/icons/example_bell.svg';

// 탭 props는 쌍으로만: 둘 다 주면 탭 렌더(데스크탑), 둘 다 없으면 미렌더(모바일)
type TopNavBarProps = {
  onPressWrite?: () => void; // 미구현
  onPressNotification?: () => void; // 미구현
  notificationCount?: number;
  className?: string; // 셸이 컨테이너 스타일 조정용
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
        'w-full max-w-limit flex-row items-center justify-between self-center rounded-lg px-lg py-sm shadow-dropdown',
        className
      )}
    >
      {/* 왼쪽: 로고 (홈 링크) */}
      <Link href="/" asChild>
        <Pressable>
          <Logo />
        </Pressable>
      </Link>

      {/* 오른쪽: (탭) + 액션 */}
      <View className="flex-row items-center gap-lg">
        {/* 탭 — 데스크탑에서만 (props 쌍이 왔을 때) */}
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

        {/* 종 아이콘 + 뱃지 */}
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

        {/* 기록 작성 버튼 */}
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
