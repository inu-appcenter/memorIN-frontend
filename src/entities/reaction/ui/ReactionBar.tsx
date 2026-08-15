import { useState, type ReactNode } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { ReactionSummary } from './ReactionSummary';
import { ReactionPicker } from './ReactionPicker';
import { useCommentReactionState } from '../model/useCommentReactions';
import type { EmojiSummary } from '../api/reactionApi';

interface ReactionBarProps {
  postId: string;
  commentId: string;
  emojis: EmojiSummary[];
  children: ReactNode;
}

const BADGE_SIZE_PX = 26;

// 데스크톱: 행에 마우스를 올리면 우측 상단에 배지가 나타남
// 폰/태블릿: 롱프레스 시 피커가 열림
// 롱프레스는 device와 무관하게 항상 켜둔다 — desktop 폭이어도 실제로는 마우스 없는
// 터치 전용 태블릿(가로모드 대형 태블릿 등)일 수 있어서, 폭만으로 막으면 그런
// 기기에서 반응 피커를 열 방법이 아예 없어진다.
export function ReactionBar({
  postId,
  commentId,
  emojis,
  children,
}: ReactionBarProps) {
  const { device } = useBreakpoints();
  const isDesktop = device === 'desktop';
  const [hovering, setHovering] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const { counts, myReactions, toggle } = useCommentReactionState(
    postId,
    commentId,
    emojis
  );

  const triggerActive = hovering || pickerVisible;

  return (
    <Pressable
      onHoverIn={() => isDesktop && setHovering(true)}
      onHoverOut={() => isDesktop && setHovering(false)}
      onLongPress={() => setPickerVisible(true)}
      style={{ position: 'relative' }}
    >
      {children}
      <ReactionSummary
        counts={counts}
        myReactions={myReactions}
        onToggle={toggle}
      />

      {isDesktop && (
        <View
          pointerEvents={triggerActive ? 'auto' : 'none'}
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 10,
            opacity: triggerActive ? 1 : 0,
          }}
        >
          <TouchableOpacity
            onPress={() => setPickerVisible(true)}
            style={{
              width: BADGE_SIZE_PX,
              height: BADGE_SIZE_PX,
              borderRadius: BADGE_SIZE_PX / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: COLORS.border,
              elevation: 4,
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 1 },
            }}
          >
            <Text style={{ fontSize: 14 }}>😀</Text>
          </TouchableOpacity>
        </View>
      )}

      <ReactionPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={toggle}
      />
    </Pressable>
  );
}
