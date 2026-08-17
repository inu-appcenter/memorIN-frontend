export type TabItem = 'feed' | 'search' | 'log' | 'chat';

export type SideNavItem = TabItem | 'settings';

export const TABLISTS: TabItem[] = ['feed', 'search', 'log', 'chat'];

// 데스크탑/테블릿 좌측 메뉴 — 탭 목록 + 하단에 붙는 설정
export const SIDE_NAV_ITEMS: SideNavItem[] = [...TABLISTS, 'settings'];

export const TAB_LABELS: Record<SideNavItem, string> = {
  feed: '피드',
  search: '탐색',
  log: '기록',
  chat: '채팅',
  settings: '설정',
};

export const PATH: Record<SideNavItem, string> = {
  feed: '/feed',
  search: '/search',
  log: '/log',
  chat: '/chat',
  settings: '/settings',
};
