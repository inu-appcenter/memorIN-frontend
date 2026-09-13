import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { DashedBox } from '@/shared/ui/dashedBox';
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';
import PlusIcon from '@/shared/assets/icons/plus.svg';
import { useMediaPicker } from '@/features/media-upload';
import {
  TagSelect,
  TimeslotSelect,
  VisibilitySelect,
  usePostForm,
  useCreatePost,
} from '@/features/post-create';

const CAPTION_MIN_HEIGHT = 96;
const CAPTION_MAX_HEIGHT = 160;
const CAPTION_VERTICAL_PADDING = 12;
const MEDIA_ASPECT_RATIO = 4 / 3;
const MIN_VIEWPORT_WIDTH = 768;
const MAX_VIEWPORT_WIDTH = 1200;
const MIN_CONTENT_WIDTH = 654;
const MAX_CONTENT_WIDTH = 720;

function resolveContentWidth(viewportWidth: number): number {
  const progress =
    (viewportWidth - MIN_VIEWPORT_WIDTH) /
    (MAX_VIEWPORT_WIDTH - MIN_VIEWPORT_WIDTH);
  const width =
    MIN_CONTENT_WIDTH + progress * (MAX_CONTENT_WIDTH - MIN_CONTENT_WIDTH);
  return Math.min(MAX_CONTENT_WIDTH, Math.max(MIN_CONTENT_WIDTH, width));
}

export function UploadPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { device } = useBreakpoints();
  const { width: viewportWidth } = useWindowDimensions();

  const isPhone = device === 'phone';
  // 좌우 패딩이 폭에 포함되면 시안 수치와 어긋나므로 넓은 화면에서는 세로 패딩만 준다.
  const contentClass = isPhone ? 'mx-auto w-full px-lg py-lg' : 'mx-auto py-lg';
  const contentStyle = isPhone
    ? undefined
    : { width: resolveContentWidth(viewportWidth) };

  const { assets, pickAssets } = useMediaPicker();
  const {
    caption,
    setCaption,
    timeslot,
    setTimeslot,
    visibility,
    setVisibility,
    tags,
    setTags,
  } = usePostForm();
  const { mutate: submitPost, isPending } = useCreatePost();

  const [contentHeight, setContentHeight] = useState(CAPTION_MIN_HEIGHT);
  const captionInputHeight = Math.min(
    Math.max(contentHeight, CAPTION_MIN_HEIGHT),
    CAPTION_MAX_HEIGHT
  );

  const cover = assets[0];
  const isDirty =
    assets.length > 0 || caption.trim().length > 0 || tags.length > 0;

  const handleBack = () => {
    if (!isDirty) {
      router.back();
      return;
    }

    if (Platform.OS === 'web') {
      if (
        window.confirm(
          `${t('uploadPage.discardTitle')}\n${t('uploadPage.discardMessage')}`
        )
      ) {
        router.back();
      }
      return;
    }

    Alert.alert(t('uploadPage.discardTitle'), t('uploadPage.discardMessage'), [
      { text: t('uploadPage.discardCancel'), style: 'cancel' },
      {
        text: t('uploadPage.discardConfirm'),
        style: 'destructive',
        onPress: () => router.back(),
      },
    ]);
  };

  const handleSubmit = () => {
    if (!cover) {
      Alert.alert(t('uploadPage.needMedia'));
      return;
    }
    submitPost(
      {
        content: JSON.stringify([{ text: caption }]),
        visibilityType: visibility,
        timeslotType: timeslot,
        assets,
        tags,
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
      <View className="h-[56px] flex-row items-center gap-sm border-b border-border px-lg">
        <Pressable onPress={handleBack} hitSlop={8}>
          <ArrowLeftIcon width={20} height={20} color={COLORS.text} />
        </Pressable>
        <Text variant="heading">{t('uploadPage.title')}</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName={`${contentClass} gap-xl`}
        contentContainerStyle={contentStyle}
      >
        <TimeslotSelect
          value={timeslot}
          onChange={setTimeslot}
          disabled={isPending}
        />

        {cover ? (
          <View
            className="relative w-full overflow-hidden rounded-lg"
            style={{ aspectRatio: MEDIA_ASPECT_RATIO }}
          >
            <Image
              source={{ uri: cover.uri }}
              className="h-full w-full bg-surface"
              resizeMode="cover"
            />
            <Pressable
              onPress={pickAssets}
              disabled={isPending}
              className="absolute right-md top-md rounded-full px-md py-xs"
              style={{ backgroundColor: COLORS.surfaceDarkOverlay }}
            >
              <Text variant="label" className="text-on-brand">
                {t('uploadPage.changeMedia')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <DashedBox
            className="bg-surface"
            style={{ aspectRatio: MEDIA_ASPECT_RATIO }}
          >
            <Pressable
              onPress={pickAssets}
              disabled={isPending}
              className="h-full w-full items-center justify-center gap-sm"
            >
              <PlusIcon width={24} height={24} color={COLORS.textMuted} />
              <Text className="text-muted">{t('uploadPage.addMedia')}</Text>
            </Pressable>
          </DashedBox>
        )}

        <View
          className="rounded-lg bg-surface px-lg"
          style={{ paddingVertical: CAPTION_VERTICAL_PADDING }}
        >
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder={t('uploadPage.captionPlaceholderPhone')}
            placeholderTextColor={COLORS.textMuted}
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

        <TagSelect value={tags} onChange={setTags} disabled={isPending} />

        <VisibilitySelect
          value={visibility}
          onChange={setVisibility}
          disabled={isPending}
          compact
        />
      </ScrollView>

      <View className={contentClass} style={contentStyle}>
        <Pressable
          onPress={handleSubmit}
          disabled={isPending}
          className="h-[52px] items-center justify-center rounded-lg bg-brand transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Text className="font-bold text-on-brand">
            {isPending ? t('uploadPage.submitting') : t('uploadPage.title')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
