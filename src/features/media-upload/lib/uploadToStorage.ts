import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import type { PresignedUpload } from '@/features/media-upload/api/mediaApi';
import i18next from '@/shared/lib/i18n';

export async function uploadToStorage(
  presigned: PresignedUpload,
  fileUri: string
): Promise<void> {
  if (Platform.OS === 'web') {
    // 웹: Blob을 fetch body로 업로드 후 즉시 종료
    const blob = await (await fetch(fileUri)).blob();
    const res = await fetch(presigned.uploadUrl, {
      method: presigned.method, // PUT
      headers: presigned.requiredHeaders,
      body: blob,
    });
    if (!res.ok) {
      throw new Error(i18next.t('upload.uploadFailed', { status: res.status }));
    }
    return;
  }

  // 네이티브(Android/iOS): 파일을 스트리밍 PUT
  const result = await FileSystem.uploadAsync(presigned.uploadUrl, fileUri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: presigned.requiredHeaders,
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(
      i18next.t('upload.uploadFailed', { status: result.status })
    );
  }
}
