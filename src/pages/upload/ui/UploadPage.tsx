import { useEffect, useRef, useState } from 'react';
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
import { toast } from '@/shared/lib/toast';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { DashedBox } from '@/shared/ui/dashedBox';
import BackArrowIcon from '@/shared/assets/icons/back-arrow.svg';
import PlusIcon from '@/shared/assets/icons/plus.svg';
import { useMediaPicker } from '@/features/media-upload';
import {
  TagSelect,
  TimeslotSelect,
  VisibilitySelect,
  usePostForm,
  useCreatePost,
} from '@/features/post-create';
import { PostVideoThumbnail } from '@/entities/post/ui/PostVideoThumbnail';

const CAPTION_MIN_HEIGHT = 96;
const CAPTION_MAX_HEIGHT = 160;
const CAPTION_VERTICAL_PADDING = 12;
const MEDIA_ASPECT_RATIO = 4 / 3;
const MIN_VIEWPORT_WIDTH = 768;
const MAX_VIEWPORT_WIDTH = 1200;
const MIN_CONTENT_WIDTH = 654;
const MAX_CONTENT_WIDTH = 720;

// 나가기 확인 문구. 업로드 중에는 쓰던 글뿐 아니라 진행 중인 업로드도 멈추므로 따로 묻는다.
type LeaveMode = 'editing' | 'uploading';
const LEAVE_DIALOG_KEYS = {
  editing: {
    title: 'uploadPage.discardTitle',
    message: 'uploadPage.discardMessage',
    keep: 'uploadPage.discardCancel',
  },
  uploading: {
    title: 'uploadPage.cancelUploadTitle',
    message: 'uploadPage.cancelUploadMessage',
    keep: 'uploadPage.cancelUploadKeep',
  },
} as const satisfies Record<
  LeaveMode,
  { title: string; message: string; keep: string }
>;

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

  // 진행 중인 업로드. 화면을 떠나면 끊어서 나간 뒤에 게시물이 생기지 않게 한다.
  const uploadAbortRef = useRef<AbortController | null>(null);
  useEffect(() => () => uploadAbortRef.current?.abort(), []);

  const [contentHeight, setContentHeight] = useState(CAPTION_MIN_HEIGHT);
  const captionInputHeight = Math.min(
    Math.max(contentHeight, CAPTION_MIN_HEIGHT),
    CAPTION_MAX_HEIGHT
  );

  const cover = assets[0];
  const isDirty =
    assets.length > 0 || caption.trim().length > 0 || tags.length > 0;

  const leave = () => {
    uploadAbortRef.current?.abort();
    router.back();
  };

  const handleBack = () => {
    if (!isDirty && !isPending) {
      router.back();
      return;
    }

    const keys = LEAVE_DIALOG_KEYS[isPending ? 'uploading' : 'editing'];

    if (Platform.OS === 'web') {
      if (window.confirm(`${t(keys.title)}\n${t(keys.message)}`)) {
        leave();
      }
      return;
    }

    Alert.alert(t(keys.title), t(keys.message), [
      { text: t(keys.keep), style: 'cancel' },
      {
        text: t('uploadPage.discardConfirm'),
        style: 'destructive',
        onPress: leave,
      },
    ]);
  };

  // 오류 안내는 모든 플랫폼에서 토스트로 한다. 웹에서 Alert.alert는 아무것도 띄우지 않는다.
  const handleSubmit = () => {
    if (!cover) {
      toast.error(t('uploadPage.needMedia'));
      return;
    }
    const controller = new AbortController();
    uploadAbortRef.current = controller;
    submitPost(
      {
        content: JSON.stringify([{ text: caption }]),
        visibilityType: visibility,
        timeslotType: timeslot,
        assets,
        tags,
        signal: controller.signal,
      },
      {
        onSuccess: () => router.replace('/feed'),
        // 실패 메시지(용량 초과, 업로드 실패 (403) 등)가 이미 완결된 문장이라 제목을 붙이지 않는다.
        onError: (error) => {
          // 사용자가 나가서 끊은 경우다. axios는 취소도 NETWORK 오류로 바꾸므로
          // 오류 종류가 아니라 signal로 판단한다.
          if (controller.signal.aborted) return;
          toast.error(
            error instanceof Error && error.message
              ? error.message
              : t('postEdit.unknownError')
          );
        },
        onSettled: () => {
          if (uploadAbortRef.current === controller) {
            uploadAbortRef.current = null;
          }
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-page">
      <View className="h-[56px] flex-row items-center gap-sm border-b border-border px-lg">
        <Pressable onPress={handleBack} hitSlop={8}>
          <BackArrowIcon width={20} height={20} color={COLORS.text} />
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
            className="relative w-full overflow-hidden rounded-lg bg-surface"
            style={{ aspectRatio: MEDIA_ASPECT_RATIO }}
          >
            {/* 동영상은 Image로 그려지지 않아 정지 프레임을 따로 뽑는다 */}
            {cover.type === 'video' ? (
              <PostVideoThumbnail
                uri={cover.uri}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <Image
                source={{ uri: cover.uri }}
                className="h-full w-full"
                resizeMode="cover"
              />
            )}
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
