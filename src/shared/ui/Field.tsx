import { useState } from 'react';
import {
  Image,
  Pressable,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { cn } from '@/shared/lib/utils';
import eyeIcon from '@/shared/assets/icons/free-icon-eye.png';
import hideIcon from '@/shared/assets/icons/free-icon-hide.png';

interface FieldProps extends TextInputProps {
  error?: string;
  isPassword?: boolean; // true면 표시/숨김 토글 아이콘 버튼이 붙는다
}

export function Field({
  error,
  isPassword,
  secureTextEntry,
  ...props
}: FieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <View className="justify-center">
        <TextInput
          className={cn(
            'h-[50px] rounded-md bg-surface px-lg text-primary',
            isPassword && 'pr-[44px]'
          )}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={isPassword ? !visible : secureTextEntry}
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setVisible((prev) => !prev)}
            hitSlop={8}
            className="absolute right-lg"
          >
            <Image
              source={visible ? eyeIcon : hideIcon}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          </Pressable>
        )}
      </View>
      {error && (
        <Text variant="caption" className="mt-xs text-error">
          {error}
        </Text>
      )}
    </View>
  );
}
