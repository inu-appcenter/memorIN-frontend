import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import ChatIcon from '@/shared/assets/icons/chat.svg';

interface ChatEmptyStateProps {
  // roomId는 있는데 그런 방이 없을 때와, 아직 아무 방도 안 고른 상태를 구분한다.
  notFound?: boolean;
}

// 분할 뷰에서 대화창 자리가 비었을 때 채우는 화면
export function ChatEmptyState({ notFound = false }: ChatEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-md bg-surface px-xl">
      <ChatIcon width={40} height={40} color={COLORS.textMuted} />
      <Text variant="body-strong" className="text-secondary">
        {notFound ? t('chat.roomNotFound') : t('chat.emptyTitle')}
      </Text>
      {!notFound && (
        <Text className="text-center text-muted">
          {t('chat.emptyDescription')}
        </Text>
      )}
    </View>
  );
}
