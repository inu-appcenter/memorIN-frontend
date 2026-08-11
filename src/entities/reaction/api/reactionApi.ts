import { client } from '@/shared/api/client';
import type { EmojiType } from '../model/emojiTypeMap';

export interface EmojiSummary {
  emojiType: EmojiType;
  count: number;
  reactedByMe: boolean;
}

// CommentEmojiController는 DTO를 그대로 응답 바디로 내려준다 —> client.post의 결과를 data.data가 아니라 data로 바로 쓴다.
export async function toggleCommentEmojis(
  commentId: string,
  emojiType: EmojiType
): Promise<{ emojiType: EmojiType; added: boolean }> {
  const { data } = await client.post<{ emojiType: EmojiType; added: boolean }>(
    `/api/comments/${commentId}/emojis`,
    { emojiType }
  );
  return data;
}
