import { TextInput, View, type TextInputProps } from 'react-native';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';

interface FieldProps extends TextInputProps {
  error?: string;
}

export function Field({ error, ...props }: FieldProps) {
  return (
    <View>
      <TextInput
        className="h-[50px] rounded-md bg-surface px-lg text-primary"
        placeholderTextColor={COLORS.textMuted}
        {...props}
      />
      {error && (
        <Text variant="caption" className="mt-xs text-error">
          {error}
        </Text>
      )}
    </View>
  );
}
