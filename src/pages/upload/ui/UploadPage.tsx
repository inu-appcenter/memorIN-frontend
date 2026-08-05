import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { DashedBox } from '@/shared/ui/dashedBox';
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';
import CameraIcon from '@/shared/assets/icons/camera.svg';
import { MediaPickerGrid, useMediaPicker } from '@/features/media-upload';
import {
  TimeslotSelect,
  VisibilitySelect,
  usePostForm,
  useCreatePost,
} from '@/features/post-create';

// 입력창 자체의 높이 범위(바깥 박스는 여기에 상하 패딩만 더한 크기가 된다)
const CAPTION_MIN_HEIGHT = 30;
const CAPTION_MAX_HEIGHT = 124;
const CAPTION_VERTICAL_PADDING = 8;
const CAPTION_PLACEHOLDER = '이 순간을 기록해보세요...';
const CAPTION_PLACEHOLDER_MOBILE = '무슨 순간이었나요?';

export function UploadPage() {
  const router = useRouter();
  const { device } = useBreakpoints();
  const isMobile = device === 'mobile';
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

  // 입력 내용에 맞춰 높이를 늘린다. 별도 Text로 높이를 재면 네이티브 입력창(EditText)이
  // 실제로 필요로 하는 높이와 어긋나 글자가 잘리므로, TextInput이 직접 보고하는 값을 쓴다.
  const [contentHeight, setContentHeight] = useState(CAPTION_MIN_HEIGHT);
  const captionMinHeight = isMobile ? 96 : CAPTION_MIN_HEIGHT;
  const captionInputHeight = Math.min(
    Math.max(contentHeight, captionMinHeight),
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
      <View
        className={
          isMobile
            ? 'h-[56px] flex-row items-center gap-sm border-b border-border px-lg'
            : 'h-[62px] flex-row items-center justify-between border-b border-border px-lg'
        }
      >
        {isMobile ? (
          <>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <ArrowLeftIcon width={20} height={20} color={COLORS.text} />
            </Pressable>
            <Text variant="heading">기록 올리기</Text>
          </>
        ) : (
          <>
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
          </>
        )}
      </View>

      {isMobile ? (
        <>
          <ScrollView className="flex-1" contentContainerClassName="p-lg">
            <View className="mb-2xl">
              <DashedBox className="h-[160px] bg-surface">
                <Pressable
                  onPress={pickAssets}
                  disabled={isPending}
                  className="h-full w-full items-center justify-center gap-sm"
                >
                  <CameraIcon width={32} height={32} />
                  <Text className="font-bold">사진 또는 영상 추가</Text>
                  <Text className="text-muted">
                    {assets.length > 0
                      ? `${assets.length}장 · 자동 압축됨`
                      : '오늘의 순간을 담아보세요'}
                  </Text>
                </Pressable>
              </DashedBox>
            </View>
            <View className="mb-2xl">
              <View
                className="rounded-lg border border-border bg-surface px-lg"
                style={{ paddingVertical: CAPTION_VERTICAL_PADDING }}
              >
                <TextInput
                  value={caption}
                  onChangeText={setCaption}
                  placeholder={CAPTION_PLACEHOLDER_MOBILE}
                  multiline
                  editable={!isPending}
                  textAlignVertical="top"
                  onContentSizeChange={(e) =>
                    setContentHeight(e.nativeEvent.contentSize.height)
                  }
                  style={{ height: captionInputHeight, padding: 0 }}
                  className="text-[14px] leading-[150%] text-primary"
                />
              </View>
            </View>
            <View className="mb-2xl">
              <TimeslotSelect
                value={timeslot}
                onChange={setTimeslot}
                disabled={isPending}
                variant="card"
              />
            </View>
            <VisibilitySelect
              value={visibility}
              onChange={setVisibility}
              disabled={isPending}
              compact
            />
          </ScrollView>
          <View className="p-lg">
            <Pressable
              onPress={handleSubmit}
              disabled={isPending}
              className="h-[52px] items-center justify-center rounded-lg bg-brand disabled:opacity-50"
            >
              <Text className="font-bold text-on-brand">
                {isPending ? '업로드 중...' : '기록 올리기'}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
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
            className="rounded-lg bg-surface px-lg"
            style={{ paddingVertical: CAPTION_VERTICAL_PADDING }}
          >
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder={CAPTION_PLACEHOLDER}
              multiline
              editable={!isPending}
              textAlignVertical="top"
              onContentSizeChange={(e) =>
                setContentHeight(e.nativeEvent.contentSize.height)
              }
              style={{ height: captionInputHeight, padding: 0 }}
              className="text-[14px] leading-[150%] text-primary"
            />
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
              · 나만 보기로 설정하면 댓글・반응이 꺼져요
            </Text>
            <Text variant="caption" className="text-muted">
              · 업로드 시 이미지・영상이 자동으로 압축돼요
            </Text>
          </View>
          <Pressable
            onPress={handleSubmit}
            disabled={isPending}
            className="h-[52px] items-center justify-center rounded-lg bg-brand transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Text className="font-bold text-on-brand">
              {isPending ? '업로드 중...' : '기록 올리기'}
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}
