import { useEffect } from 'react';
import { View } from 'react-native';
import { Portal } from '@rn-primitives/portal';
import { Text } from './text';
import {
  useToastStore,
  type ToastItem as ToastItemType,
} from '@/shared/lib/toast';

const DURATION_MS = 3000;

function ToastItem({ id, variant, message }: ToastItemType) {
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(id), DURATION_MS);
    return () => clearTimeout(timer);
  }, [id, dismiss]);

  return (
    <View
      className={
        variant === 'error'
          ? 'mb-sm w-full max-w-[360px] rounded-md bg-error px-lg py-md'
          : 'mb-sm w-full max-w-[360px] rounded-md bg-success px-lg py-md'
      }
    >
      <Text className="text-on-brand">{message}</Text>
    </View>
  );
}

// 루트 레이아웃에 한 번만 마운트. rn-primitives/portal이 이미 뜬 <PortalHost />로
// 내용을 그려주기 때문에 웹/네이티브 모두 동일하게 최상단에 오버레이로 뜬다.
export function ToastHost() {
  const toasts = useToastStore((state) => state.toasts);
  if (toasts.length === 0) return null;

  return (
    <Portal name="toast-host">
      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 top-0 items-center px-lg pb-xl pt-3xl"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} />
        ))}
      </View>
    </Portal>
  );
}
