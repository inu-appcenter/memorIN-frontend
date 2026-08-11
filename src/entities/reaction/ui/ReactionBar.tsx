import { useState, type ReactNode } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
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

// 댓글 행 전체를 감싸는 반응 UI 래퍼
// 데스크톱: 행에 마우스를 올리면 우측 상단에 배지가 나타남
// 모바일/태블릿: 롱프레스 시 피커가 열림

// 배지는 Pressable이 아니라 TouchableOpacity로 만든다. react-native-web의 Pressable은 useHover에 contain:true를 넘겨서, 마우스가 들어올 때 버블링되는 lock 이벤트를 쏜다.
// 이걸 조상 Pressable이 받으면 "다른 요소가 hover를 가져갔다"고 판단해 onHoverOut을 발동시키기 때문에, 배지에 마우스를 올리는 순간 부모의 호버가 풀렸다 붙었다 하며 무한히 깜빡인다.
// TouchableOpacity는 useHover를 쓰지 않아서 해당 문제가 없음
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
      onLongPress={() => !isDesktop && setPickerVisible(true)}
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
