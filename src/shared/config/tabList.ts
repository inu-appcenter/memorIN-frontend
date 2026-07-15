export type TabItem = 'feed' | 'search' | 'log' | 'chat';

export const TABLISTS: TabItem[] = ['feed', 'search', 'log', 'chat'];

export const TAB_LABELS: Record<TabItem, string> = {
  feed: '피드',
  search: '탐색',
  log: '기록',
  chat: '채팅',
};

export const PATH: Record<TabItem, string> = {
  feed: '/feed',
  search: '/search',
  log: '/log',
  chat: '/chat',
};
