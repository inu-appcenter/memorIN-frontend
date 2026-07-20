import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import type { PresignedUpload } from '@/shared/api/mediaApi';
// MinIO 직접 PUT (플랫폼 분기 "MinIO 클라이언트")

// axios client를 우회해야 한다 (plain fetch / FileSystem)
// client의 요청 인터셉터가 Authorization: Bearer를 붙이는데, 이게 MinIO presigned 서명과 충돌해 SignatureDoesNotMatch를 낼 수 있다.
export async function uploadToStorage(
  presigned: PresignedUpload,
  fileUri: string
): Promise<void> {
  if (Platform.OS === 'web') {
    // 웹: Blob을 fetch body로
    const blob = await (await fetch(fileUri)).blob();
    const res = await fetch(presigned.uploadUrl, {
      method: presigned.method, // PUT
      headers: presigned.requiredHeaders, // Content-Type 그대로
      body: blob,
    });
    if (!res.ok) throw new Error(`업로드 실패 (${res.status})`);
    return;
  }

  // 네이티브: 파일을 스트리밍 PUT (메모리에 통째로 안 올림)
  const result = await FileSystem.uploadAsync(presigned.uploadUrl, fileUri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: presigned.requiredHeaders,
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`업로드 실패 (${result.status})`);
  }
}
