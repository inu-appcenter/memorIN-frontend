import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@/shared/ui/text';
import { uploadMedia } from '@/features/media-upload/lib/uploadMedia';

export function UploadPage() {
  const [uploading, setUploading] = useState(false);

  const handlePickAndUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진/동영상 접근 권한을 허용해주세요.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 1,
    });
    if (result.canceled || result.assets.length === 0) return;

    const picked = result.assets[0];
    const type = picked.type === 'video' ? 'video' : 'image';
    const fileName =
      picked.fileName ??
      `test-${Date.now()}.${type === 'video' ? 'mp4' : 'jpg'}`;

    setUploading(true);
    try {
      console.log('[업로드 테스트] 원본:', {
        uri: picked.uri,
        fileSize: picked.fileSize,
        mimeType: picked.mimeType,
      });

      const objectKey = await uploadMedia(
        { uri: picked.uri, type, mimeType: picked.mimeType },
        fileName
      );

      console.log('[업로드 테스트] 성공, objectKey:', objectKey);
      Alert.alert('업로드 성공', objectKey);
    } catch (e) {
      console.error('[업로드 테스트] 실패', e);
      Alert.alert('업로드 실패', e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-page">
      <View className="h-[62px] flex-row items-center justify-between border-b border-border px-lg">
        <Text variant="title">‹ 기록 올리기</Text>
        <Text className="font-bold text-link">완료</Text>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-[720px] gap-lg p-lg"
      >
        <Pressable
          onPress={handlePickAndUpload}
          disabled={uploading}
          className="h-[280px] items-center justify-center rounded-lg border border-dashed border-border bg-surface"
        >
          <Text className="text-[40px] text-muted">＋</Text>
          <Text className="font-bold">
            {uploading ? '업로드 중...' : '사진 또는 영상 추가'}
          </Text>
          <Text className="text-muted">오늘의 순간을 담아보세요</Text>
        </Pressable>
        <View className="h-[96px] rounded-md bg-surface p-lg">
          <Text className="text-muted">이 순간을 기록해보세요...</Text>
        </View>
        <View className="gap-md">
          <Text className="font-bold">시간대</Text>
          <View className="flex-row gap-sm">
            {['오전', '오후'].map((label, index) => (
              <View
                key={label}
                className={`rounded-full border px-lg py-sm ${index === 0 ? 'border-brand bg-brand' : 'border-border bg-page'}`}
              >
                <Text
                  className={index === 0 ? 'text-on-brand' : 'text-secondary'}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View className="gap-md">
          <Text className="font-bold">공개 범위</Text>
          <View className="flex-row gap-sm">
            {['전체', '친구', '나만 보기'].map((label, index) => (
              <View
                key={label}
                className={`rounded-full border px-lg py-sm ${index === 0 ? 'border-brand-subtle bg-brand-subtle' : 'border-border bg-page'}`}
              >
                <Text className={index === 0 ? 'text-link' : 'text-secondary'}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <Pressable
          onPress={handlePickAndUpload}
          disabled={uploading}
          className="h-[52px] items-center justify-center rounded-md bg-brand"
        >
          <Text className="font-bold text-on-brand">기록 올리기</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
