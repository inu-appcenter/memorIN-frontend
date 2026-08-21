import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import SubmitArrowIcon from '@/shared/assets/icons/submitArrow.svg';
import { cn } from '@/shared/lib/utils';

interface ReplyBarProps {
  onSubmit: (text: string) => void;
  variant?: 'dark' | 'light';
  placeholder?: string;
  padded?: boolean; // 기본 내부 여백(px-md py-sm) 적용 여부. 바깥에서 이미 여백을 주는 경우 false로 끔
}

// 댓글/메시지 하단 입력줄 — 입력창 + 제출(화살표) 버튼만 있다.
// 웹에서는 TextInput의 onSubmitEditing이 Enter 입력에도 반응해서 제출된다.
export function ReplyBar({
  onSubmit,
  variant = 'dark',
  placeholder,
  padded = true,
}: ReplyBarProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const isDark = variant === 'dark';
  // 공백만 입력한 상태에서는 전송 버튼 자체를 막는다.
  const canSubmit = text.trim().length > 0;

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  };

  const inputStyle = isDark
    ? {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        color: '#FFFFFF',
      }
    : {
        backgroundColor: '#F7F8FA',
        borderWidth: 1,
        borderColor: '#DADCE3',
        color: '#131519',
      };

  return (
    <View
      className={cn('flex-row items-center gap-sm', padded && 'px-md py-sm')}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder ?? t('reply.placeholder')}
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : '#8A8F9C'}
        onSubmitEditing={handleSubmit}
        returnKeyType="send"
        className="h-[36px] flex-1 rounded-full px-md"
        style={inputStyle}
      />
      <Pressable
        onPress={handleSubmit}
        disabled={!canSubmit}
        hitSlop={8}
        style={{ opacity: canSubmit ? 1 : 0.35 }}
      >
        <SubmitArrowIcon
          width={20}
          height={20}
          color={isDark ? '#FFFFFF' : '#012EAF'}
        />
      </Pressable>
    </View>
  );
}
