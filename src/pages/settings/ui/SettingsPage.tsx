import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import type { SvgProps } from 'react-native-svg';
import { Text } from '@/shared/ui/text';
import { Sheet } from '@/shared/ui/sheet';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { showNotReady } from '@/shared/lib/showNotReady';
import {
  changeLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/shared/lib/i18n';
import { useLogout } from '@/features/auth/model/useLogout';
import BackArrowIcon from '@/shared/assets/icons/back-arrow.svg';
import UserIcon from '@/shared/assets/icons/user.svg';
import MailIcon from '@/shared/assets/icons/mail.svg';
import UsersIcon from '@/shared/assets/icons/users.svg';
import BellIcon from '@/shared/assets/icons/bell.svg';
import InfoIcon from '@/shared/assets/icons/info.svg';
import RightArrowIcon from '@/shared/assets/icons/chevron-right.svg';

function SectionTitle({ label }: { label: string }) {
  return (
    <View className="px-xl pb-sm pt-xl">
      <Text variant="caption" className="text-neutral-800">
        {label}
      </Text>
    </View>
  );
}

// 시안의 설정 행 — 좌측 아이콘, 라벨, 우측 꺾쇠.
function NavRow({
  icon: Icon,
  label,
  onPress,
}: {
  icon: FC<SvgProps>;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-[56px] flex-row items-center gap-md px-xl py-lg active:bg-subtle"
    >
      <Icon width={22} height={22} color={COLORS.tertiary} />
      <Text className="flex-1 text-primary">{label}</Text>
      <RightArrowIcon width={18} height={18} color={COLORS.neutral700} />
    </Pressable>
  );
}

function ValueRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <View className="min-h-[56px] flex-row items-center justify-between gap-lg px-xl py-lg">
      <Text className="text-primary">{label}</Text>
      {typeof value === 'string' ? (
        <Text className="text-muted" numberOfLines={1}>
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
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
  const [languageSheetVisible, setLanguageSheetVisible] = useState(false);
  const logout = useLogout();

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
          <BackArrowIcon width={20} height={20} color={COLORS.text} />
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
          <SectionTitle label={t('settings.sectionProfile')} />
          <NavRow
            icon={UserIcon}
            label={t('settings.rowAccount')}
            onPress={() => router.push('/account')}
          />
          {/* 시안이 헤더만 있는 빈 화면이라 무엇을 넣을지 정해진 뒤 만든다 */}
          <NavRow
            icon={MailIcon}
            label={t('settings.rowMyRecords')}
            onPress={showNotReady}
          />
          <NavRow
            icon={UsersIcon}
            label={t('settings.rowFriends')}
            onPress={() => router.push('/social')}
          />

          <SectionTitle label={t('settings.sectionNotification')} />
          <NavRow
            icon={BellIcon}
            label={t('settings.rowNotification')}
            onPress={() => router.push('/notification-settings')}
          />

          <SectionTitle label={t('settings.sectionSupport')} />
          <NavRow
            icon={InfoIcon}
            label={t('settings.rowNotice')}
            onPress={showNotReady}
          />

          {/* 시안에는 없지만 없애면 기능이 사라지는 항목들 */}
          <SectionTitle label={t('settings.sectionEtc')} />
          <Pressable
            onPress={() => setLanguageSheetVisible(true)}
            className="active:bg-subtle"
          >
            <ValueRow
              label={t('settings.fieldLanguage')}
              value={languageLabel[currentLanguage]}
            />
          </Pressable>
          <ValueRow label={t('settings.fieldVersion')} value={appVersion} />
          <Pressable
            onPress={() => logout.mutate()}
            disabled={logout.isPending}
            className="min-h-[56px] justify-center px-xl py-lg active:bg-subtle"
          >
            <Text className={logout.isPending ? 'text-muted' : 'text-error'}>
              {logout.isPending ? t('profile.loggingOut') : t('profile.logout')}
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      <LanguageSheet
        visible={languageSheetVisible}
        onClose={() => setLanguageSheetVisible(false)}
      />
    </View>
  );
}
