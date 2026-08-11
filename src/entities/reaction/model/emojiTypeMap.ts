import type { ReactionType } from './types';

export type EmojiType = 'HEART' | 'DISLIKE' | 'LIKE' | 'NO' | 'CHECK' | 'FIRE';

export const REACTION_TO_EMOJI_TYPE: Record<ReactionType, EmojiType> = {
  fire: 'FIRE',
  check: 'CHECK',
  cross: 'NO',
  love: 'HEART',
  thumbsUp: 'LIKE',
  thumbsDown: 'DISLIKE',
};

export const EMOJI_TYPE_TO_REACTION: Record<EmojiType, ReactionType> = {
  FIRE: 'fire',
  CHECK: 'check',
  NO: 'cross',
  HEART: 'love',
  LIKE: 'thumbsUp',
  DISLIKE: 'thumbsDown',
};
