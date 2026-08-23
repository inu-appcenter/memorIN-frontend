import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { Sheet } from '@/shared/ui/sheet';
import { showNotReady } from '@/shared/lib/showNotReady';
import { COLORS } from '@/shared/lib/theme';
import CalendarIcon from '@/shared/assets/icons/share/calendar.svg';
import GalleryIcon from '@/shared/assets/icons/share/gallery.svg';
import RightIcon from '@/shared/assets/icons/share/right.svg';

interface ChatAttachSheetProps {
  visible: boolean;
  onClose: () => void;
  onPressShareRecord: () => void;
}

// 채팅 입력줄의 + 버튼이 여는 옵션 시트.
// "사진/영상 업로드"는 메시지 전송 API가 없어 아직 동작하지 않는다.
export function ChatAttachSheet({
  visible,
  onClose,
  onPressShareRecord,
}: ChatAttachSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="gap-lg px-md pb-md">
        <Text variant="heading">{t('chatAttach.title')}</Text>

        <Pressable
          onPress={onPressShareRecord}
          className="flex-row items-center gap-md py-md"
        >
          <CalendarIcon width={22} height={22} color={COLORS.text} />
          <Text variant="body" className="flex-1 text-primary">
            {t('chatAttach.shareRecord')}
          </Text>
          <RightIcon />
        </Pressable>

        <Pressable
          onPress={() => {
            onClose();
            showNotReady();
          }}
          className="flex-row items-center gap-md py-md"
        >
          <GalleryIcon width={22} height={22} color={COLORS.text} />
          <Text variant="body" className="flex-1 text-primary">
            {t('chatAttach.uploadMedia')}
          </Text>
          <RightIcon />
        </Pressable>
      </View>
    </Sheet>
  );
}
