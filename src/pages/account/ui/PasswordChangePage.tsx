import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { Field } from '@/shared/ui/Field';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { showNotReady } from '@/shared/lib/showNotReady';
import BackArrowIcon from '@/shared/assets/icons/back-arrow.svg';

export function PasswordChangePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { device } = useBreakpoints();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  // 비밀번호 변경 API가 없어 입력만 받고 안내한다.
  // 서버가 생기면 여기서 검증과 요청으로 이어진다.
  const canSubmit = current.length > 0 && next.length > 0 && next === confirm;

  return (
    <View className="flex-1 bg-page">
      <View className="flex-row items-center gap-md px-xl py-lg">
        <Pressable
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/account')
          }
          hitSlop={8}
        >
          <BackArrowIcon width={20} height={20} color={COLORS.text} />
        </Pressable>
        <Text variant="heading">{t('passwordChange.title')}</Text>
      </View>

      <View
        className="flex-1"
        style={device === 'desktop' ? { alignItems: 'center' } : undefined}
      >
        <ScrollView
          className="w-full flex-1"
          contentContainerClassName="gap-md px-xl pb-2xl pt-lg"
          style={device === 'desktop' ? { maxWidth: 720 } : undefined}
        >
          <Field
            isPassword
            value={current}
            onChangeText={setCurrent}
            placeholder={t('passwordChange.current')}
            autoCapitalize="none"
          />
          <Field
            isPassword
            value={next}
            onChangeText={setNext}
            placeholder={t('passwordChange.next')}
            autoCapitalize="none"
          />
          <Field
            isPassword
            value={confirm}
            onChangeText={setConfirm}
            placeholder={t('passwordChange.confirm')}
            autoCapitalize="none"
            error={
              confirm.length > 0 && next !== confirm
                ? t('passwordChange.mismatch')
                : undefined
            }
          />
        </ScrollView>

        <View
          className="w-full px-xl pb-xl"
          style={device === 'desktop' ? { maxWidth: 720 } : undefined}
        >
          <Pressable
            onPress={showNotReady}
            disabled={!canSubmit}
            className="h-[52px] items-center justify-center rounded-lg bg-brand disabled:opacity-50"
          >
            <Text className="font-bold text-on-brand">
              {t('passwordChange.submit')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
