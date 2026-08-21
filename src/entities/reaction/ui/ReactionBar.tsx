import { useState, type ReactNode } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { ReactionSummary } from './ReactionSummary';
import { ReactionPicker } from './ReactionPicker';
import { useCommentReactionState } from '../model/useCommentReactions';
import type { EmojiSummary } from '../api/reactionApi';

const BADGE_SIZE_PX = 26;

export interface ReactionBarRenderState {
  /** 데스크탑에서 행에 마우스를 올린 상태. 폰/태블릿에서는 항상 false */
  hovering: boolean;
  /** 이모지 피커를 여는 버튼. 호버 시 노출할 자리에 그대로 렌더하면 된다 */
  pickerButton: ReactNode;
}

interface ReactionBarProps {
  postId: string;
  commentId: string;
  emojis: EmojiSummary[];
  // 반응 배지 목록의 좌측 들여쓰기(px). 배지를 본문 텍스트 라인에 맞추고,
  // 답글이면 답글 들여쓰기까지 더해서 계층이 어긋나지 않게 한다.
  summaryIndent?: number;
  // 배지를 행 안쪽(••• 옆)에 놓아야 해서 렌더 프롭으로 호버 상태를 내려준다.
  // 절대 배치로 띄우면 ••• 와 겹치고 호버 추적끼리 간섭해 깜빡인다.
  children: (state: ReactionBarRenderState) => ReactNode;
}

// 데스크톱: 행에 마우스를 올리면 ••• 옆에 이모지 배지가 나타남
// 폰/태블릿: 롱프레스 시 피커가 열림
// 롱프레스는 device와 무관하게 항상 켜둔다 — desktop 폭이어도 실제로는 마우스 없는
// 터치 전용 태블릿일 수 있어서, 폭만으로 막으면 피커를 열 방법이 없어진다.
export function ReactionBar({
  postId,
  commentId,
  emojis,
  children,
  summaryIndent = 0,
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

  const badgeVisible = isDesktop && (hovering || pickerVisible);

  // 폭만 차지하는 높이 0 앵커 안에 절대 배치한다. 배지를 일반 흐름에 두면
  // 26px 높이가 줄 전체를 밀어올려 본문이 아래로 내려간다.
  const pickerButton = isDesktop ? (
    <View style={{ width: BADGE_SIZE_PX, height: 0 }}>
      <View
        pointerEvents={badgeVisible ? 'auto' : 'none'}
        style={{
          position: 'absolute',
          left: 0,
          top: -BADGE_SIZE_PX / 2,
          width: BADGE_SIZE_PX,
          height: BADGE_SIZE_PX,
          opacity: badgeVisible ? 1 : 0,
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
          }}
        >
          <Text style={{ fontSize: 13 }}>😀</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : null;

  return (
    <Pressable
      onHoverIn={() => isDesktop && setHovering(true)}
      onHoverOut={() => isDesktop && setHovering(false)}
      onLongPress={() => setPickerVisible(true)}
      style={{ position: 'relative' }}
    >
      {children({
        hovering: isDesktop && (hovering || pickerVisible),
        pickerButton,
      })}
      <View style={{ paddingLeft: summaryIndent }}>
        <ReactionSummary
          counts={counts}
          myReactions={myReactions}
          onToggle={toggle}
        />
      </View>
      <ReactionPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={toggle}
      />
    </Pressable>
  );
}
