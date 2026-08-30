import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/shared/lib/theme';
import { showNotReady } from '@/shared/lib/showNotReady';
// 배럴(@/features/post-share)을 거치면 PostShareSheet → PostCard →
// features/post-share로 이어지는 순환이 생겨 컴포넌트가 undefined가 된다.
import { ChatAttachSheet } from '@/features/post-share/ui/ChatAttachSheet';
import { RecordPickerSheet } from '@/features/post-share/ui/RecordPickerSheet';
import ChatPlusIcon from '@/shared/assets/icons/chatPlus.svg';
import SubmitArrowIcon from '@/shared/assets/icons/submitArrow.svg';

// 대화창 하단 메시지 입력창.
//
// 입력은 되지만 전송은 아직 미구현
// 방 API가 나오면 showNotReady 자리를 실제 전송으로 교체한다.
export function ChatInputBar() {
  const { t } = useTranslation();
  const [attachVisible, setAttachVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [draft, setDraft] = useState('');

  const canSend = draft.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    showNotReady();
  };

  return (
    <>
      <View className="h-[76px] flex-row items-center gap-md border-t border-border bg-page px-xl">
        <Pressable onPress={() => setAttachVisible(true)} hitSlop={8}>
          <ChatPlusIcon width={24} height={24} />
        </Pressable>

        <View className="h-[44px] flex-1 justify-center rounded-full bg-surface px-lg">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('chat.inputPlaceholder')}
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            // 전송 후에도 포커스를 유지해 연속 입력이 끊기지 않게 한다.
            submitBehavior="submit"
            className="flex-1 text-primary"
          />
        </View>

        {/* 보낼 내용이 없으면 회색. */}
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          hitSlop={8}
          accessibilityLabel={t('chat.send')}
        >
          <SubmitArrowIcon
            width={22}
            height={22}
            color={canSend ? COLORS.brand : COLORS.textMuted}
          />
        </Pressable>
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
