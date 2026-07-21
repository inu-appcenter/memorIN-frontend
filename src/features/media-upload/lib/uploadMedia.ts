import { compressMedia } from './compressMedia';
import { getPresignedUploadUrl } from '../api/mediaApi';
import { uploadToStorage } from './uploadToStorage';

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
  },
  fileName: string
): Promise<UploadedAttachment> {
  const { uri, contentType, contentLength, width, height } =
    await compressMedia(asset);
  const presigned = await getPresignedUploadUrl({
    fileName,
    contentType,
    contentLength,
  });
  await uploadToStorage(presigned, uri);
  return {
    fileKey: presigned.objectKey,
    mimeType: contentType,
    fileSizeBytes: contentLength,
    width,
    height,
  };
}
