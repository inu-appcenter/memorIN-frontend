export type TabItem = 'feed' | 'chat' | 'profile' | 'social';
export const TABLISTS: TabItem[] = ['feed', 'chat', 'profile', 'social'];

export const TAB_LABELS: Record<TabItem, string> = {
  feed: '피드',
  chat: '채팅',
  profile: '프로필',
  social: '친구',
};

export const PATH: Record<TabItem, string> = {
  feed: '/feed',
  chat: '/chat',
  profile: '/profile',
  social: '/social',
};
