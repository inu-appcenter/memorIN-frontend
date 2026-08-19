import i18next from '@/shared/lib/i18n';

export type TabItem = 'feed' | 'search' | 'log' | 'chat';

export type SideNavItem = TabItem | 'settings';

export const TABLISTS: TabItem[] = ['feed', 'search', 'log', 'chat'];

// 데스크탑/테블릿 좌측 메뉴 — 탭 목록 + 하단에 붙는 설정
export const SIDE_NAV_ITEMS: SideNavItem[] = [...TABLISTS, 'settings'];

// 예전엔 TAB_LABELS 상수 객체였는데, 모듈 로드 시 1회만 평가돼서 언어를 바꿔도
// 라벨이 그대로 남는 문제가 있다. 호출 시점에 번역되도록 함수로 바꿨다.
export function getTabLabel(tab: SideNavItem): string {
  return i18next.t(`tabs.${tab}` as const);
}

export const PATH: Record<SideNavItem, string> = {
  feed: '/feed',
  search: '/search',
  log: '/log',
  chat: '/chat',
  settings: '/settings',
};
