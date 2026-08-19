import 'i18next';
import type ko from '@/shared/locales/ko/common.json';

// ko/common.json을 번역 키의 원본으로 삼아 t() 인자를 타입 체크한다.
// 존재하지 않는 키를 쓰면 tsc가 실패한다.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: { common: typeof ko };
  }
}
