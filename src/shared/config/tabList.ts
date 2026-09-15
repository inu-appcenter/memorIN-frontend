import i18next from '@/shared/lib/i18n';

export type TabItem = 'feed' | 'search' | 'log' | 'chat' | 'profile';

export type SideNavItem = TabItem | 'settings';

// 폰 하단 탭에 올라가는 것들. 기록은 마이페이지 안의 캘린더로 들어가 빠졌다.
export type BottomTabItem = 'feed' | 'search' | 'chat' | 'profile';

export const TABLISTS: BottomTabItem[] = ['feed', 'search', 'chat', 'profile'];

// 데스크탑/테블릿 좌측 메뉴 — 기록이 독립 화면으로 남고 하단에 설정이 붙는다.
export const SIDE_NAV_ITEMS: SideNavItem[] = [
  'feed',
  'search',
  'log',
  'chat',
  'settings',
];

// 활성 표시 판정용. 폰과 넓은 화면의 목록이 갈려 어느 쪽에도 빠짐이 없도록 전부 담는다.
export const ALL_NAV_ITEMS: SideNavItem[] = [
  'feed',
  'search',
  'log',
  'chat',
  'profile',
  'settings',
];

// 폰 하단 탭만 시안 문구가 다르다 — 피드가 '홈'이다. 좌측 메뉴는 기존 라벨을 쓴다.
const BOTTOM_TAB_LABEL_KEY = {
  feed: 'tabs.home',
  search: 'tabs.search',
  chat: 'tabs.chat',
  profile: 'tabs.profile',
} as const satisfies Record<BottomTabItem, string>;

// 예전엔 TAB_LABELS 상수 객체였는데, 모듈 로드 시 1회만 평가돼서 언어를 바꿔도
// 라벨이 그대로 남는 문제가 있다. 호출 시점에 번역되도록 함수로 바꿨다.
export function getTabLabel(tab: SideNavItem): string {
  return i18next.t(`tabs.${tab}` as const);
}

export function getBottomTabLabel(tab: BottomTabItem): string {
  return i18next.t(BOTTOM_TAB_LABEL_KEY[tab]);
}

export const PATH: Record<SideNavItem, string> = {
  feed: '/feed',
  search: '/search',
  log: '/log',
  chat: '/chat',
  profile: '/profile',
  settings: '/settings',
};
