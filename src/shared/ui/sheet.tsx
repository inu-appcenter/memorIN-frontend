import { Modal, Pressable, View, type ModalProps } from 'react-native';
import { cn } from '@/shared/lib/utils';

interface SheetProps extends Omit<ModalProps, 'visible'> {
  visible: boolean;
  onClose: () => void;
  className?: string;
}

// 하단에서 올라오는 시트 — 테블릿/폰의 날짜 상세, 댓글 목록 등에서 재사용
export function Sheet({
  visible,
  onClose,
  className,
  children,
  ...props
}: SheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      {...props}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute bottom-0 left-0 right-0 top-0 bg-black/40"
          onPress={onClose}
        />
        <View
          className={cn('max-h-[80%] rounded-t-lg bg-page p-lg', className)}
        >
          <View className="mb-md h-[4px] w-[40px] self-center rounded-full bg-border" />
          {children}
        </View>
      </View>
    </Modal>
  );
}
