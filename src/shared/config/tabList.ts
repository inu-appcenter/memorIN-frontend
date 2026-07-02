export type TabItem = "feed" | "chat" | "profile" | "friends";
export const TABLISTS: TabItem[] = ["feed", "chat", "profile", "friends"];

export const TAB_LABELS: Record<TabItem, string> = {
  feed: "피드",
  chat: "채팅",
  profile: "프로필",
  friends: "친구",
};

export const PATH: Record<TabItem, string> = {
  feed: "/feed",
  chat: "/chat",
  profile: "/profile",
  friends: "/friends",
};
