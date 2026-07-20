import { compressMedia } from './compressMedia';
import { getPresignedUploadUrl } from '@/features/media-upload/api/mediaApi';
import { uploadToStorage } from './uploadToStorage';

export async function uploadMedia(
  asset: { uri: string; type: 'image' | 'video'; mimeType?: string },
  fileName: string
): Promise<string> {
  const { uri, contentType, contentLength } = await compressMedia(asset);
  console.log('[업로드 테스트] 압축 후:', { contentType, contentLength }); // 추가
  const presigned = await getPresignedUploadUrl({
    fileName,
    contentType,
    contentLength,
  });
  await uploadToStorage(presigned, uri);
  return presigned.objectKey;
}
