import { View, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '@/shared/ui/text';
import { TABLISTS, TAB_LABELS, type TabItem } from '@/shared/config/tabList';
import { cn } from '@/shared/lib/utils';
import FeedIcon from '@/shared/assets/icons/example_feed.svg';
import ChatIcon from '@/shared/assets/icons/example_chat.svg';
import SocialIcon from '@/shared/assets/icons/example_social.svg';
import ProfileIcon from '@/shared/assets/icons/example_profile.svg';
import { COLORS } from '@/shared/lib/theme';

const TAB_ICONS: Record<TabItem, React.FC<any>> = {
  feed: FeedIcon,
  social: SocialIcon,
  chat: ChatIcon,
  profile: ProfileIcon,
};

interface NavBarProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
  navigate: (tab: TabItem) => void;
  activeTab: TabItem;
  onPressAdd?: () => void; // 중앙 + 버튼 액션 프랍 추가
}

export const NavBar = ({
  className,
  style,
  navigate,
  activeTab,
  onPressAdd,
}: NavBarProps) => {
  // 탭 렌더링 로직을 분리하여 중복 방지 <- 컴포넌트 화
  const renderTabItem = (t: TabItem) => {
    const Icon = TAB_ICONS[t];
    const isActive = activeTab === t;

    return (
      <Pressable
        key={t}
        className="flex-1 items-center justify-center gap-1"
        onPress={() => navigate(t)}
      >
        {Icon && (
          <Icon
            width={22}
            height={16}
            color={isActive ? COLORS.accent : '#C9F8FB'}
          />
        )}
        <Text
          className={`text-xs font-semibold ${
            isActive ? 'text-accent' : 'text-on-brand'
          }`}
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
      {/* 왼쪽 탭 */}
      {leftTabs.map(renderTabItem)}

      {/* 중앙 플로팅 버튼 영역 */}
      <View className="w-16 items-center justify-center">
        <Pressable
          className="absolute h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg"
          onPress={onPressAdd}
        >
          <Text className="mb-1 text-3xl font-bold text-white">+</Text>
        </Pressable>
      </View>

      {/* 오른쪽 탭 */}
      {rightTabs.map(renderTabItem)}
    </View>
  );
};
