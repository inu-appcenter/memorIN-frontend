import type React from 'react';
import type { SvgProps } from 'react-native-svg';
import FireIcon from '@/shared/assets/icons/reactions/fire.svg';
import CheckIcon from '@/shared/assets/icons/reactions/check.svg';
import CrossIcon from '@/shared/assets/icons/reactions/cross.svg';
import LoveIcon from '@/shared/assets/icons/reactions/love.svg';
import ThumbsUpIcon from '@/shared/assets/icons/reactions/thumbsUp.svg';
import ThumbsDownIcon from '@/shared/assets/icons/reactions/thumbsDown.svg';
import type { ReactionType } from './types';

// 피커에 노출되는 순서 그대로
export const REACTION_TYPES: ReactionType[] = [
  'fire',
  'check',
  'cross',
  'love',
  'thumbsUp',
  'thumbsDown',
];

export const REACTION_ICONS: Record<ReactionType, React.FC<SvgProps>> = {
  fire: FireIcon,
  check: CheckIcon,
  cross: CrossIcon,
  love: LoveIcon,
  thumbsUp: ThumbsUpIcon,
  thumbsDown: ThumbsDownIcon,
};
