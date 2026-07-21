import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { MediaPickerGrid, useMediaPicker } from '@/features/media-upload';
import {
  TimeslotSelect,
  VisibilitySelect,
  usePostForm,
  useCreatePost,
} from '@/features/post-create';

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
        <Text variant="title">‹ 기록 올리기</Text>
        <Pressable onPress={handleSubmit} disabled={isPending}>
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
        <View className="h-[96px] rounded-md bg-surface p-lg">
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="이 순간을 기록해보세요..."
            multiline
            editable={!isPending}
            className="flex-1 text-primary"
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
        <Pressable
          onPress={handleSubmit}
          disabled={isPending}
          className="h-[52px] items-center justify-center rounded-md bg-brand disabled:opacity-50"
        >
          <Text className="font-bold text-on-brand">
            {isPending ? '업로드 중...' : '기록 올리기'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
