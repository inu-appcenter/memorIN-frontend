import { Image, Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { DashedBox } from '@/shared/ui/dashedBox';
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
      <DashedBox className="h-[280px] bg-surface">
        <Pressable
          onPress={onPick}
          disabled={disabled}
          className="group h-full w-full items-center justify-center gap-sm transition-colors hover:bg-page"
        >
          <View className="h-[56px] w-[56px] items-center justify-center rounded-full bg-border transition-colors group-hover:bg-brand-subtle">
            <Text className="text-[28px] text-tertiary transition-colors group-hover:text-link">
              ＋
            </Text>
          </View>
          <Text className="font-bold">사진 또는 영상 추가</Text>
          <Text className="text-muted">오늘의 순간을 담아보세요</Text>
        </Pressable>
      </DashedBox>
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
                className="absolute right-xs top-xs h-[24px] w-[24px] items-center justify-center rounded-full bg-page transition-opacity hover:opacity-70"
              >
                <Text className="text-error">×</Text>
              </Pressable>
            </View>
          ))}
          {canAddMore && (
            <Pressable
              onPress={onPick}
              disabled={disabled}
              className="group h-[120px] w-[120px] items-center justify-center rounded-md border border-dashed border-border bg-surface transition-colors hover:bg-page"
            >
              <Text className="text-[28px] text-muted transition-colors group-hover:text-link">
                ＋
              </Text>
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
