import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { languageStorage } from './languageStorage';
import ko from '@/shared/locales/ko/common.json';
import en from '@/shared/locales/en/common.json';

export const SUPPORTED_LANGUAGES = ['ko', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'ko';

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value ?? '');
}

function resolveDeviceLanguage(): SupportedLanguage {
  const [primary] = Localization.getLocales();
  const code = primary?.languageCode ?? null;
  return isSupportedLanguage(code) ? code : DEFAULT_LANGUAGE;
}

// 앱 부팅 시 1회 호출. 저장된 수동 선택 언어가 있으면 그걸, 없으면 기기
// 로케일을 기준으로 초기 언어를 정한다.
export async function initI18n(): Promise<void> {
  const stored = await languageStorage.get();
  const initialLanguage = isSupportedLanguage(stored)
    ? stored
    : resolveDeviceLanguage();

  await i18next.use(initReactI18next).init({
    resources: {
      ko: { common: ko },
      en: { common: en },
    },
    lng: initialLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: 'common',
    ns: ['common'],
    interpolation: { escapeValue: false },
    debug: __DEV__,
  });
}

// 설정 화면 등에서 사용자가 수동으로 언어를 바꿀 때 호출.
export async function changeLanguage(
  language: SupportedLanguage
): Promise<void> {
  await languageStorage.set(language);
  await i18next.changeLanguage(language);
}

export default i18next;
