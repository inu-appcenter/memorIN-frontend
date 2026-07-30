import { useState } from 'react';
import { Alert, Platform, Pressable, TextInput, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { Sheet } from '@/shared/ui/sheet';
import { COLORS } from '@/shared/lib/theme';
import { TimeslotSelect, VisibilitySelect } from '@/features/post-create';
import { useUpdatePost } from '@/entities/post/model/useUpdatePost';
import { extractPreviewText } from '@/entities/post/model/postContent';
import type { PostSummary } from '@/entities/post/api/postsApi';

interface EditPostSheetProps {
  visible: boolean;
  onClose: () => void;
  post: PostSummary;
}

// 캡션 / 시간대 / 공개범위만 수정한다. 미디어 재업로드는 범위 밖(별도 작업으로 분리).
export function EditPostSheet({ visible, onClose, post }: EditPostSheetProps) {
  const [caption, setCaption] = useState(() =>
    extractPreviewText(post.content)
  );
  const [timeslot, setTimeslot] = useState(post.timeslot ?? 'AM');
  const [visibility, setVisibility] = useState(post.visibility);
  const { mutate: submitUpdate, isPending } = useUpdatePost();

  const handleSubmit = () => {
    submitUpdate(
      {
        postId: post.postId,
        params: {
          content: JSON.stringify([{ text: caption }]),
          visibilityType: visibility,
          timeslotType: timeslot,
        },
      },
      {
        onSuccess: () => onClose(),
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : '알 수 없는 오류';
          if (Platform.OS === 'web') {
            window.alert(`수정 실패: ${message}`);
          } else {
            Alert.alert('수정 실패', message);
          }
        },
      }
    );
  };

  return (
    <Sheet visible={visible} onClose={onClose} className="h-[70%]">
      <View className="gap-lg">
        <Text variant="heading">게시물 수정</Text>
        <View className="min-h-[100px] rounded-md bg-surface p-lg">
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="이 순간을 기록해보세요..."
            multiline
            editable={!isPending}
            textAlignVertical="top"
            style={{ includeFontPadding: false, minHeight: 76 }}
            className="text-primary"
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
        <View className="flex-row gap-sm">
          <Pressable
            onPress={onClose}
            disabled={isPending}
            className="h-[48px] flex-1 items-center justify-center rounded-md border border-border"
          >
            <Text className="font-bold text-secondary">취소</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={isPending}
            style={{ backgroundColor: COLORS.brand }}
            className="h-[48px] flex-1 items-center justify-center rounded-md disabled:opacity-50"
          >
            <Text className="font-bold text-on-brand">
              {isPending ? '저장 중...' : '저장'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Sheet>
  );
}
