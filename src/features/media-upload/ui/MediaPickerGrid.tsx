import { Image, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import type { PickedMediaAsset } from '../model/useMediaPicker';

interface MediaPickerGridProps {
  assets: PickedMediaAsset[];
  maxAttachments: number;
  canAddMore: boolean;
  disabled?: boolean;
  onPick: () => void;
  onRemove: (uri: string) => void;
}

export function MediaPickerGrid({
  assets,
  maxAttachments,
  canAddMore,
  disabled,
  onPick,
  onRemove,
}: MediaPickerGridProps) {
  if (assets.length === 0) {
    return (
      <Pressable
        onPress={onPick}
        disabled={disabled}
        className="h-[280px] items-center justify-center rounded-lg border border-dashed border-border bg-surface"
      >
        <Text className="text-[40px] text-muted">＋</Text>
        <Text className="font-bold">사진 또는 영상 추가</Text>
        <Text className="text-muted">오늘의 순간을 담아보세요</Text>
      </Pressable>
    );
  }

  return (
    <View className="gap-sm">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-sm">
          {assets.map((asset) => (
            <View key={asset.uri} className="h-[120px] w-[120px]">
              {asset.type === 'image' ? (
                <Image
                  source={{ uri: asset.uri }}
                  className="h-full w-full rounded-md bg-surface"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-full w-full items-center justify-center rounded-md border border-dashed border-border bg-surface">
                  <Text className="text-tertiary">VIDEO</Text>
                </View>
              )}
              <Pressable
                onPress={() => onRemove(asset.uri)}
                disabled={disabled}
                className="absolute right-xs top-xs h-[24px] w-[24px] items-center justify-center rounded-full bg-page"
              >
                <Text className="text-error">×</Text>
              </Pressable>
            </View>
          ))}
          {canAddMore && (
            <Pressable
              onPress={onPick}
              disabled={disabled}
              className="h-[120px] w-[120px] items-center justify-center rounded-md border border-dashed border-border bg-surface"
            >
              <Text className="text-[28px] text-muted">＋</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
      <Text variant="caption" className="text-muted">
        {assets.length} / {maxAttachments}
      </Text>
    </View>
  );
}
