import type { ReactNode } from 'react';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
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
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';

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
    ko: t('settings.languageKorean'),
    en: t('settings.languageEnglish'),
    // jp: t('settings.없는 키'), npm run typecheck 테스트를 위해 추가
  };

  const handleSelect = (language: SupportedLanguage) => {
    changeLanguage(language);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 8, gap: 4 }}>
        <Text variant="heading" style={{ marginBottom: 12 }}>
          {t('settings.languageSheetTitle')}
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

  const appVersion = Constants.expoConfig?.version ?? t('settings.emptyValue');

  const languageLabel: Record<SupportedLanguage, string> = {
    ko: t('settings.languageKorean'),
    en: t('settings.languageEnglish'),
  };
  const currentLanguage = (i18n.language as SupportedLanguage) ?? 'ko';

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
        <Text variant="heading">{t('settings.title')}</Text>
      </View>

      <View
        className="flex-1"
        style={device === 'desktop' ? { alignItems: 'center' } : undefined}
      >
        <ScrollView
          className="w-full flex-1"
          style={device === 'desktop' ? { maxWidth: 720 } : undefined}
        >
          <SectionTitle label={t('settings.sectionAccount')} />
          {isLoading ? (
            <View className="items-center py-2xl">
              <ActivityIndicator color={COLORS.brand} />
            </View>
          ) : (
            <>
              <SettingRow
                label={t('settings.fieldName')}
                value={profile?.displayName ?? t('settings.emptyValue')}
              />
              <SettingRow
                label={t('settings.fieldUsername')}
                value={
                  profile?.username
                    ? `@${profile.username}`
                    : t('settings.emptyValue')
                }
              />
              <SettingRow
                label={t('settings.fieldEmail')}
                value={email ?? t('settings.emptyValue')}
              />
            </>
          )}

          <SectionTitle label={t('settings.sectionGeneral')} />
          <SettingRow
            label={t('settings.fieldLanguage')}
            value={languageLabel[currentLanguage]}
            onPress={() => setLanguageSheetVisible(true)}
          />
          <SettingRow
            label={t('settings.fieldNotification')}
            value={t('settings.comingSoon')}
            disabled
          />

          <SectionTitle label={t('settings.sectionAppInfo')} />
          <SettingRow label={t('settings.fieldVersion')} value={appVersion} />
        </ScrollView>
      </View>

      <LanguageSheet
        visible={languageSheetVisible}
        onClose={() => setLanguageSheetVisible(false)}
      />
    </View>
  );
}
