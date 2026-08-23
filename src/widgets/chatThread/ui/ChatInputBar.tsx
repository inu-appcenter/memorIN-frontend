import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { ChatAttachSheet, RecordPickerSheet } from '@/features/post-share';
import ChatPlusIcon from '@/shared/assets/icons/chatPlus.svg';
import SubmitArrowIcon from '@/shared/assets/icons/submitArrow.svg';

// 대화창 하단 메시지 입력창
export function ChatInputBar() {
  const { t } = useTranslation();
  const [attachVisible, setAttachVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  return (
    <>
      <View className="h-[76px] flex-row items-center gap-md border-t border-border bg-page px-xl">
        <Pressable onPress={() => setAttachVisible(true)} hitSlop={8}>
          <ChatPlusIcon width={18} height={18} />
        </Pressable>
        <View className="h-[44px] flex-1 justify-center rounded-full bg-surface px-lg">
          <Text className="text-muted">{t('chat.inputPlaceholder')}</Text>
        </View>
        {/* 메시지 전송 API가 없어 아직 동작하지 않는다. 댓글 입력줄(ReplyBar)과
            같은 아이콘을 써서 전송 액션임을 일관되게 표현한다. */}
        <SubmitArrowIcon width={22} height={22} color={COLORS.brand} />
      </View>

      <ChatAttachSheet
        visible={attachVisible}
        onClose={() => setAttachVisible(false)}
        onPressShareRecord={() => {
          setAttachVisible(false);
          setPickerVisible(true);
        }}
      />

      <RecordPickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
      />
    </>
  );
}
