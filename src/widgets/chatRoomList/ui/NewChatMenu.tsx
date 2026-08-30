import { Modal, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { showNotReady } from '@/shared/lib/showNotReady';
import ChatIcon from '@/shared/assets/icons/chat.svg';
import FeedChatIcon from '@/shared/assets/icons/feedChat.svg';

// 헤더 우측 상단 아이콘 아래에 붙는 위치
const MENU_TOP = 92;
const MENU_RIGHT = 16;

interface NewChatMenuProps {
  visible: boolean;
  onClose: () => void;
}

function MenuRow({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-[52px] flex-row items-center gap-md px-lg active:bg-subtle"
    >
      {icon}
      <Text className="text-primary">{label}</Text>
    </Pressable>
  );
}

// 새 채팅(+)을 누르면 열리는 메뉴. 실제 생성 플로우는 백엔드 대기라 안내만 띄움.
export function NewChatMenu({ visible, onClose }: NewChatMenuProps) {
  const { t } = useTranslation();

  const handleSelect = () => {
    onClose();
    showNotReady();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 바깥 아무 곳이나 누르면 닫힌다 */}
      <Pressable className="flex-1" onPress={onClose}>
        <View
          style={{ position: 'absolute', top: MENU_TOP, right: MENU_RIGHT }}
          className="min-w-[168px] overflow-hidden rounded-lg bg-page py-xs shadow-modal"
        >
          <MenuRow
            label={t('chat.newChatDirect')}
            icon={
              <FeedChatIcon width={20} height={20} color={COLORS.tertiary} />
            }
            onPress={handleSelect}
          />
          <MenuRow
            label={t('chat.newChatGroup')}
            icon={<ChatIcon width={20} height={20} color={COLORS.tertiary} />}
            onPress={handleSelect}
          />
        </View>
      </Pressable>
    </Modal>
  );
}
