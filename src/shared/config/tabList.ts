import i18next from '@/shared/lib/i18n';

export type TabItem = 'feed' | 'search' | 'log' | 'chat' | 'profile';

export type SideNavItem = TabItem | 'settings' | 'notifications';

// 폰 하단 탭에 올라가는 것들. 기록은 마이페이지 안의 캘린더로 들어가 빠졌다.
export type BottomTabItem = 'feed' | 'search' | 'chat' | 'profile';

export const TABLISTS: BottomTabItem[] = ['feed', 'search', 'chat', 'profile'];

// 태블릿 좌측 레일 — 폰 하단 탭과 같은 구성이다. 기기마다 구조가 갈리면
// 같은 서비스를 두 번 익혀야 한다.
//
// 설정은 마이페이지 우상단 기어로 들어간다. 기록은 마이페이지의 캘린더로
// 들어가 별도 진입점을 두지 않는다.
export const SIDE_NAV_ITEMS: SideNavItem[] = [
  'feed',
  'search',
  'chat',
  'profile',
];

// 데스크탑 좌측 사이드바 — 폭에 여유가 있어 알림을 함께 둔다.
// 좁은 화면에서는 마이페이지 헤더의 벨로 들어간다.
export const DESKTOP_NAV_ITEMS: SideNavItem[] = [
  ...SIDE_NAV_ITEMS,
  'notifications',
];

// 활성 표시 판정용. 메뉴에서 빠진 항목도 담는다 — 링크로 직접 들어와도
// 어느 탭인지는 판정되어야 한다.
export const ALL_NAV_ITEMS: SideNavItem[] = [
  'feed',
  'search',
  'log',
  'chat',
  'profile',
  'settings',
  'notifications',
];

// 폰 하단 탭만 시안 문구가 다르다 — 피드가 '홈', 마이페이지가 '마이'다.
// 좌측 메뉴는 폭에 여유가 있어 전체 이름을 쓴다.
const BOTTOM_TAB_LABEL_KEY = {
  feed: 'tabs.home',
  search: 'tabs.search',
  chat: 'tabs.chat',
  profile: 'tabs.me',
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
  notifications: '/notifications',
};
