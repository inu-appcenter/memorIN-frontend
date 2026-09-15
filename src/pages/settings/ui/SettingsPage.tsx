import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { Text } from '@/shared/ui/text';
import { Sheet } from '@/shared/ui/sheet';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import {
  changeLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/shared/lib/i18n';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { useMyProfile } from '@/entities/session/model/useMyProfile';
import { useLogout } from '@/features/auth/model/useLogout';
import { usePushSubscription, type PushState } from '@/features/push';
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';

// as const를 사용하여 객체 값들이 string으로 넓혀지는(widening) 것을 방지
const PUSH_LABEL_KEY = {
  unsupported: 'settings.pushUnsupported',
  devBuildRequired: 'settings.pushDevBuildRequired',
  unconfigured: 'settings.pushUnconfigured',
  denied: 'settings.pushDenied',
  off: 'settings.pushOff',
  on: 'settings.pushOn',
} as const;

function SectionTitle({ label }: { label: string }) {
  return (
    <View className="bg-surface px-xl py-md">
      <Text variant="body-strong" className="text-muted">
        {label}
      </Text>
    </View>
  );
}

function SettingRow({
  label,
  value,
  onPress,
  disabled,
}: {
  label: string;
  value?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const content = (
    <View className="min-h-[56px] flex-row items-center justify-between gap-lg px-xl py-lg">
      <Text className={disabled ? 'text-muted' : 'text-primary'}>{label}</Text>
      <View className="max-w-[60%] flex-row items-center gap-sm">
        {typeof value === 'string' ? (
          <Text className="text-muted" numberOfLines={1}>
            {value}
          </Text>
        ) : (
          value
        )}
        {onPress && !disabled && <Text className="text-tertiary">›</Text>}
      </View>
    </View>
  );

  if (!onPress || disabled) return content;

  return (
    <Pressable onPress={onPress} className="active:bg-subtle">
      {content}
    </Pressable>
  );
}

function LanguageSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();

  const languageLabel: Record<SupportedLanguage, string> = {
    ko: t('settings.languageKorean' as any),
    en: t('settings.languageEnglish' as any),
  };

  const handleSelect = (language: SupportedLanguage) => {
    changeLanguage(language);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 8, gap: 4 }}>
        <Text variant="heading" style={{ marginBottom: 12 }}>
          {t('settings.languageSheetTitle' as any)}
        </Text>

        {SUPPORTED_LANGUAGES.map((language) => (
          <Pressable
            key={language}
            onPress={() => handleSelect(language)}
            style={{ paddingVertical: 12 }}
            className="flex-row items-center justify-between"
          >
            <Text
              variant="body"
              className={
                i18n.language === language
                  ? 'font-bold text-brand'
                  : 'text-primary'
              }
            >
              {languageLabel[language]}
            </Text>
            {i18n.language === language && (
              <Text className="text-brand">✓</Text>
            )}
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}

export function SettingsPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { device } = useBreakpoints();
  const email = useAuthStore((s) => s.user?.email);
  const { data: profile, isLoading } = useMyProfile();
  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);
  const push = usePushSubscription();
  const logout = useLogout();

  const appVersion =
    Constants.expoConfig?.version ?? t('settings.emptyValue' as any);

  const languageLabel: Record<SupportedLanguage, string> = {
    ko: t('settings.languageKorean' as any),
    en: t('settings.languageEnglish' as any),
  };
  const currentLanguage = (i18n.language as SupportedLanguage) ?? 'ko';

  const pushRowDisabled =
    push.isBusy ||
    push.state === 'unsupported' ||
    push.state === 'devBuildRequired' ||
    push.state === 'unconfigured' ||
    (push.state === 'denied' && Platform.OS === 'web');

  return (
    <View className="flex-1 bg-page">
      <View className="flex-row items-center gap-md px-xl py-lg">
        <Pressable
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/feed')
          }
          hitSlop={8}
        >
          <ArrowLeftIcon width={20} height={20} color={COLORS.text} />
        </Pressable>
        <Text variant="heading">{t('settings.title' as any)}</Text>
      </View>

      <View
        className="flex-1"
        style={device === 'desktop' ? { alignItems: 'center' } : undefined}
      >
        <ScrollView
          className="w-full flex-1"
          style={device === 'desktop' ? { maxWidth: 720 } : undefined}
        >
          <SectionTitle label={t('settings.sectionAccount' as any)} />
          {isLoading ? (
            <View className="items-center py-2xl">
              <ActivityIndicator color={COLORS.brand} />
            </View>
          ) : (
            <>
              <SettingRow
                label={t('settings.fieldName' as any)}
                value={profile?.displayName ?? t('settings.emptyValue' as any)}
              />
              <SettingRow
                label={t('settings.fieldUsername' as any)}
                value={
                  profile?.username
                    ? `@${profile.username}`
                    : t('settings.emptyValue' as any)
                }
              />
              <SettingRow
                label={t('settings.fieldEmail' as any)}
                value={email ?? t('settings.emptyValue' as any)}
              />
            </>
          )}

          {/* 폰 마이페이지 시안에 로그아웃 버튼이 없어 여기가 유일한 진입점이다 */}
          <Pressable
            onPress={() => logout.mutate()}
            disabled={logout.isPending}
            className="min-h-[56px] justify-center px-xl py-lg active:bg-subtle"
          >
            <Text className={logout.isPending ? 'text-muted' : 'text-error'}>
              {logout.isPending ? t('profile.loggingOut') : t('profile.logout')}
            </Text>
          </Pressable>

          <SectionTitle label={t('settings.sectionGeneral' as any)} />
          <SettingRow
            label={t('settings.fieldLanguage' as any)}
            value={languageLabel[currentLanguage]}
            onPress={() => setLanguageSheetVisible(true)}
          />
          <SettingRow
            label={t('settings.fieldNotification' as any)}
            value={t(PUSH_LABEL_KEY[push.state] as any)} // 동적 키 에러 우회
            disabled={pushRowDisabled}
            onPress={
              push.state === 'on' || push.state === 'denied'
                ? push.disable
                : push.enable
            }
          />

          <SectionTitle label={t('settings.sectionAppInfo' as any)} />
          <SettingRow
            label={t('settings.fieldVersion' as any)}
            value={appVersion}
          />
        </ScrollView>
      </View>

      <LanguageSheet
        visible={languageSheetVisible}
        onClose={() => setLanguageSheetVisible(false)}
      />
    </View>
  );
}
