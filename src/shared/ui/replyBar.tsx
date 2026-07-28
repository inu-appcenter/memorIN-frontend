import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import SubmitArrowIcon from '@/shared/assets/icons/submitArrow.svg';

interface ReplyBarProps {
  onSubmit: (text: string) => void;
  variant?: 'dark' | 'light';
  placeholder?: string;
}

// 댓글/메시지 하단 입력줄 — 입력창 + 제출(화살표) 버튼만 있다.
// 웹에서는 TextInput의 onSubmitEditing이 Enter 입력에도 반응해서 제출된다.
export function ReplyBar({
  onSubmit,
  variant = 'dark',
  placeholder = '댓글 달기...',
}: ReplyBarProps) {
  const [text, setText] = useState('');
  const isDark = variant === 'dark';

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
    <View className="flex-row items-center gap-sm px-md py-sm">
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : '#8A8F9C'}
        onSubmitEditing={handleSubmit}
        returnKeyType="send"
        className="h-[36px] flex-1 rounded-full px-md"
        style={inputStyle}
      />
      <Pressable onPress={handleSubmit} hitSlop={8}>
        <SubmitArrowIcon
          width={20}
          height={20}
          color={isDark ? '#FFFFFF' : '#012EAF'}
        />
      </Pressable>
    </View>
  );
}
