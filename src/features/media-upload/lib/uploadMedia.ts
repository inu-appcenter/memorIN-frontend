import { compressMedia } from './compressMedia';
import { getPresignedUploadUrl } from '../api/mediaApi';
import { uploadToStorage } from './uploadToStorage';
import { throwIfAborted } from './abortable';

export interface UploadedAttachment {
  fileKey: string;
  mimeType: string;
  fileSizeBytes: number;
  width?: number | null;
  height?: number | null;
}

export async function uploadMedia(
  asset: {
    uri: string;
    type: 'image' | 'video';
    mimeType?: string;
    durationMs?: number | null;
    width?: number | null;
    height?: number | null;
  },
  fileName: string,
  signal?: AbortSignal
): Promise<UploadedAttachment> {
  // 압축(네이티브 영상)은 중간에 멈출 수 없어 끝난 뒤에 취소 여부를 본다.
  throwIfAborted(signal);
  const { uri, contentType, contentLength, width, height } =
    await compressMedia(asset);
  throwIfAborted(signal);
  const presigned = await getPresignedUploadUrl(
    { fileName, contentType, contentLength },
    signal
  );
  await uploadToStorage(presigned, uri, { contentLength, signal });
  return {
    fileKey: presigned.objectKey,
    mimeType: contentType,
    fileSizeBytes: contentLength,
    width,
    height,
  };
}
