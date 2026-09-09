import { useEffect } from 'react';
import { View } from 'react-native';
import { Portal } from '@rn-primitives/portal';
import { Text } from './text';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { COLORS } from '@/shared/lib/theme';
import CheckIcon from '@/shared/assets/icons/reactions/check.svg';
import {
  useToastStore,
  type ToastItem as ToastItemType,
  type ToastVariant,
} from '@/shared/lib/toast';

const DURATION_MS = 3000;

const BASE_CLASS =
  'mb-sm flex-row items-center gap-sm rounded-full px-lg py-md shadow-modal';

const VARIANT_BACKGROUND: Record<ToastVariant, string> = {
  error: COLORS.error,
  success: COLORS.success,
  neutral: COLORS.surfaceDarkBg,
};

function ToastItem({ id, variant, message }: ToastItemType) {
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(id), DURATION_MS);
    return () => clearTimeout(timer);
  }, [id, dismiss]);

  return (
    <View
      className={BASE_CLASS}
      style={{ backgroundColor: VARIANT_BACKGROUND[variant] }}
    >
      {variant === 'success' && (
        <CheckIcon
          width={16}
          height={16}
          color={COLORS.surfaceDarkTextPrimary}
        />
      )}
      <Text className="text-on-brand">{message}</Text>
    </View>
  );
}

// 루트 레이아웃에 한 번만 마운트. rn-primitives/portal이 이미 뜬 <PortalHost />로
// 내용을 그려주기 때문에 웹/네이티브 모두 동일하게 최상단에 오버레이로 뜬다.
export function ToastHost() {
  const toasts = useToastStore((state) => state.toasts);
  const { device } = useBreakpoints();

  if (toasts.length === 0) return null;

  return (
    <Portal name="toast-host">
      <View
        pointerEvents="box-none"
        className={
          device === 'phone'
            ? 'absolute inset-x-0 bottom-0 items-center px-lg pb-[96px]'
            : 'absolute inset-x-0 bottom-0 items-center px-lg pb-3xl'
        }
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} />
        ))}
      </View>
    </Portal>
  );
}
