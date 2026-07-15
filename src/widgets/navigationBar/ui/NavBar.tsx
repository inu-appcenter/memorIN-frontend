import { View, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';
import { Text } from '@/shared/ui/Text';
import { TABLISTS, TAB_LABELS, type TabItem } from '@/shared/config/tabList';
import { cn } from '@/shared/lib/utils';
import { COLORS } from '@/shared/lib/theme';
import FeedIcon from '@/shared/assets/icons/example_feed.svg';
import ChatIcon from '@/shared/assets/icons/example_chat.svg';
import SocialIcon from '@/shared/assets/icons/example_social.svg';
import ProfileIcon from '@/shared/assets/icons/example_profile.svg';

const TAB_ICONS: Record<TabItem, FC<SvgProps>> = {
  feed: FeedIcon,
  search: SocialIcon,
  log: ProfileIcon,
  chat: ChatIcon,
};

interface NavBarProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
  navigate: (tab: TabItem) => void;
  activeTab: TabItem;
  onPressAdd?: () => void;
}

export const NavBar = ({
  className,
  style,
  navigate,
  activeTab,
  onPressAdd,
}: NavBarProps) => {
  const renderTabItem = (t: TabItem) => {
    const Icon = TAB_ICONS[t];
    const isActive = activeTab === t;

    return (
      <Pressable
        key={t}
        className="flex-1 items-center justify-center gap-xs"
        onPress={() => navigate(t)}
      >
        {Icon && (
          <Icon
            width={22}
            height={16}
            color={isActive ? COLORS.accent : COLORS.iconDefault}
          />
        )}
        <Text
          variant="caption"
          numberOfLines={1}
          className={cn(
            'font-semibold',
            isActive ? 'text-accent' : 'text-on-brand'
          )}
        >
          {TAB_LABELS[t]}
        </Text>
      </Pressable>
    );
  };

  const middleIndex = Math.floor(TABLISTS.length / 2);
  const leftTabs = TABLISTS.slice(0, middleIndex);
  const rightTabs = TABLISTS.slice(middleIndex);

  return (
    <View
      className={cn('relative h-[80px] flex-row bg-brand', className)}
      style={style}
    >
      {leftTabs.map(renderTabItem)}

      {/* 중앙 ?�로??버튼 ?�역 */}
      <View className="w-[64px] items-center justify-center">
        {' '}
        <Pressable
          className="absolute h-[56px] w-[56px] items-center justify-center rounded-full bg-accent shadow-modal"
          onPress={onPressAdd}
        >
          <Text className="text-[32px] text-white">+</Text>
        </Pressable>
      </View>

      {rightTabs.map(renderTabItem)}
    </View>
  );
};
