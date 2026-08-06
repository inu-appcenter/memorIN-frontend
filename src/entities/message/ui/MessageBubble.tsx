import { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { cn } from '@/shared/lib/utils';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import {
  ReactionSummary,
  ReactionPicker,
  useTargetReactions,
} from '@/entities/reaction';

interface MessageBubbleProps {
  id: string;
  content: string;
  isMine: boolean;
}

const BADGE_SIZE_PX = 26;
const BADGE_SLOT_PX = 40;

// 메시지 하나를 표현하는 말풍선 — 보낸 사람이 나인지에 따라 정렬(좌/우)과 색상이 달라짐.
// 반응 트리거 배지는 말풍선 바로 옆(내 메시지는 왼쪽, 상대 메시지는 오른쪽)에 붙는다.
export function MessageBubble({ id, content, isMine }: MessageBubbleProps) {
  const { device } = useBreakpoints();
  const isDesktop = device === 'desktop';
  const [hovering, setHovering] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const { toggle } = useTargetReactions('message', id);

  const triggerActive = hovering || pickerVisible;

  return (
    <View className={cn('gap-xs', isMine ? 'items-end' : 'items-start')}>
      <Pressable
        onHoverIn={() => isDesktop && setHovering(true)}
        onHoverOut={() => isDesktop && setHovering(false)}
        onLongPress={() => !isDesktop && setPickerVisible(true)}
        style={{
          position: 'relative',
          ...(isMine
            ? { paddingLeft: BADGE_SLOT_PX, marginLeft: -BADGE_SLOT_PX }
            : { paddingRight: BADGE_SLOT_PX, marginRight: -BADGE_SLOT_PX }),
        }}
      >
        <View
          className={cn(
            'rounded-lg px-md py-sm',
            isMine ? 'bg-brand' : 'border border-border bg-page'
          )}
        >
          <Text className={isMine ? 'text-on-brand' : undefined}>
            {content}
          </Text>
        </View>

        {/* 배지 TouchableOpacity로 설정 */}
        {isDesktop && (
          <View
            pointerEvents={triggerActive ? 'auto' : 'none'}
            style={{
              position: 'absolute',
              top: '50%',
              transform: [{ translateY: -BADGE_SIZE_PX / 2 }],
              ...(isMine ? { left: 0 } : { right: 0 }),
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
                borderColor: '#DADCE3',
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
      </Pressable>

      <ReactionSummary targetType="message" targetId={id} />

      <ReactionPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={toggle}
      />
    </View>
  );
}
