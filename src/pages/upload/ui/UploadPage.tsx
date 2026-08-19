import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
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

const CAPTION_MIN_HEIGHT = 30;
const CAPTION_MAX_HEIGHT = 124;
const CAPTION_VERTICAL_PADDING = 8;

export function UploadPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { device } = useBreakpoints();
  const isPhone = device === 'phone';
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

  const [contentHeight, setContentHeight] = useState(CAPTION_MIN_HEIGHT);
  const captionMinHeight = isPhone ? 96 : CAPTION_MIN_HEIGHT;
  const captionInputHeight = Math.min(
    Math.max(contentHeight, captionMinHeight),
    CAPTION_MAX_HEIGHT
  );

  const handleSubmit = () => {
    if (assets.length === 0) {
      Alert.alert(t('uploadPage.needMedia'));
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
            t('uploadPage.failTitle'),
            error instanceof Error ? error.message : t('postEdit.unknownError')
          ),
      }
    );
  };

  return (
    <View className="flex-1 bg-page">
      <View
        className={
          isPhone
            ? 'h-[56px] flex-row items-center gap-sm border-b border-border px-lg'
            : 'h-[62px] flex-row items-center justify-between border-b border-border px-lg'
        }
      >
        {isPhone ? (
          <>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <ArrowLeftIcon width={20} height={20} color={COLORS.text} />
            </Pressable>
            <Text variant="heading">{t('uploadPage.title')}</Text>
          </>
        ) : (
          <>
            <Pressable
              onPress={() => router.back()}
              className="flex-row items-center gap-sm rounded-md px-xs py-xs transition-opacity hover:opacity-70"
            >
              <ArrowLeftIcon width={20} height={20} color={COLORS.text} />
              <Text variant="heading">{t('uploadPage.title')}</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={isPending}
              className="transition-opacity hover:opacity-70"
            >
              <Text className="font-bold text-link">
                {isPending ? t('uploadPage.submitting') : t('uploadPage.done')}
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {isPhone ? (
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
                  <Text className="font-bold">{t('upload.pickerTitle')}</Text>
                  <Text className="text-muted">
                    {assets.length > 0
                      ? t('uploadPage.assetCount', { count: assets.length })
                      : t('upload.pickerSubtitle')}
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
                  placeholder={t('uploadPage.captionPlaceholderPhone')}
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
                {isPending ? t('uploadPage.submitting') : t('uploadPage.title')}
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
              placeholder={t('uploadPage.captionPlaceholder')}
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
              {t('uploadPage.hintPrivate')}
            </Text>
            <Text variant="caption" className="text-muted">
              {t('uploadPage.hintCompress')}
            </Text>
          </View>
          <Pressable
            onPress={handleSubmit}
            disabled={isPending}
            className="h-[52px] items-center justify-center rounded-lg bg-brand transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Text className="font-bold text-on-brand">
              {isPending ? t('uploadPage.submitting') : t('uploadPage.title')}
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}
