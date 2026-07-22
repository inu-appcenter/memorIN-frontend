import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';
import { MediaPickerGrid, useMediaPicker } from '@/features/media-upload';
import {
  TimeslotSelect,
  VisibilitySelect,
  usePostForm,
  useCreatePost,
} from '@/features/post-create';

const CAPTION_MIN_HEIGHT = 46;
const CAPTION_MAX_HEIGHT = 140;
const CAPTION_VERTICAL_PADDING = 8;

export function UploadPage() {
  const router = useRouter();
  const { assets, pickAssets, removeAsset, maxAttachments, canAddMore } =
    useMediaPicker();
  const {
    caption,
    setCaption,
    timeslot,
    setTimeslot,
    visibility,
    setVisibility,
  } = usePostForm();
  const { mutate: submitPost, isPending } = useCreatePost();
  const [measuredContentHeight, setMeasuredContentHeight] = useState(0);
  const captionBoxHeight = Math.min(
    Math.max(
      measuredContentHeight + CAPTION_VERTICAL_PADDING * 2,
      CAPTION_MIN_HEIGHT
    ),
    CAPTION_MAX_HEIGHT
  );

  const handleSubmit = () => {
    if (assets.length === 0) {
      Alert.alert('사진/영상을 추가해주세요');
      return;
    }
    submitPost(
      {
        content: JSON.stringify([{ text: caption }]),
        visibilityType: visibility,
        timeslotType: timeslot,
        assets,
      },
      {
        onSuccess: () => router.replace('/feed'),
        onError: (error) =>
          Alert.alert(
            '업로드 실패',
            error instanceof Error ? error.message : '알 수 없는 오류'
          ),
      }
    );
  };

  return (
    <View className="flex-1 bg-page">
      <View className="h-[62px] flex-row items-center justify-between border-b border-border px-lg">
        {/* 웹에서만 적용되는 hover 효과 추가 (네이티브에선 무시) */}
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-sm rounded-md px-xs py-xs transition-opacity hover:opacity-70"
        >
          <ArrowLeftIcon width={20} height={20} color={COLORS.text} />
          <Text variant="heading">기록 올리기</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          disabled={isPending}
          className="transition-opacity hover:opacity-70"
        >
          <Text className="font-bold text-link">
            {isPending ? '업로드 중...' : '완료'}
          </Text>
        </Pressable>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-[720px] gap-lg p-lg"
      >
        <MediaPickerGrid
          assets={assets}
          maxAttachments={maxAttachments}
          canAddMore={canAddMore}
          disabled={isPending}
          onPick={pickAssets}
          onRemove={removeAsset}
        />
        <View
          className="rounded-md bg-surface px-lg"
          style={{
            height: captionBoxHeight,
            paddingVertical: CAPTION_VERTICAL_PADDING,
          }}
        >
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="이 순간을 기록해보세요..."
            multiline
            editable={!isPending}
            textAlignVertical="top"
            // [추가] 안드로이드가 줄마다 기본으로 더 얹는 여백을 제거해 좁은 높이에서도 안 잘리게 함
            style={{ includeFontPadding: false }}
            className="flex-1 text-primary"
          />
          <Text
            className="text-primary"
            style={{
              position: 'absolute',
              left: 16,
              right: 16,
              top: CAPTION_VERTICAL_PADDING,
              opacity: 0,
              includeFontPadding: false,
            }}
            pointerEvents="none"
            onLayout={(e) =>
              setMeasuredContentHeight(e.nativeEvent.layout.height)
            }
          >
            {caption || ' '}
          </Text>
        </View>
        <TimeslotSelect
          value={timeslot}
          onChange={setTimeslot}
          disabled={isPending}
        />
        <VisibilitySelect
          value={visibility}
          onChange={setVisibility}
          disabled={isPending}
        />
        <View className="gap-xs">
          <Text variant="caption" className="text-muted">
            · &apos;나만 보기&apos;로 설정하면 댓글・반응이 꺼져요
          </Text>
          <Text variant="caption" className="text-muted">
            · 업로드 시 이미지・영상이 자동으로 압축돼요
          </Text>
        </View>
        {/* [변경] 제출 버튼 hover 추가 */}
        <Pressable
          onPress={handleSubmit}
          disabled={isPending}
          className="h-[52px] items-center justify-center rounded-md bg-brand transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Text className="font-bold text-on-brand">
            {isPending ? '업로드 중...' : '기록 올리기'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
