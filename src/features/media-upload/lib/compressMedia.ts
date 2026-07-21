import { Platform } from 'react-native';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

// 백엔드 MINIO_MAX_UPLOAD_SIZE_BYTES 기본값과 동일 (50MiB)
const MAX_UPLOAD_SIZE_BYTES = 52428800;

// 갤러리 선택(launchImageLibraryAsync) 파일 검증
export const MAX_VIDEO_DURATION_SEC = 15;

export interface CompressedMedia {
  uri: string;
  contentType: string;
  contentLength: number;
  width?: number | null;
  height?: number | null;
}

interface MediaAsset {
  uri: string;
  type: 'image' | 'video';
  mimeType?: string;
  durationMs?: number | null;
}

export async function compressMedia(
  asset: MediaAsset
): Promise<CompressedMedia> {
  const originalSize = await getFileSize(asset.uri);

  const result =
    asset.type === 'video'
      ? await prepareVideo(asset, originalSize)
      : await compressImage(asset.uri, originalSize, asset.mimeType);

  // 압축 전/후 파일 크기를 콘솔에서 바로 비교
  logCompressionResult(asset.type, originalSize, result.contentLength);

  if (result.contentLength > MAX_UPLOAD_SIZE_BYTES) {
    const sizeMb = (result.contentLength / (1024 * 1024)).toFixed(1);
    throw new Error(
      `파일 크기(${sizeMb}MB)가 최대 업로드 용량(50MB)을 초과합니다.`
    );
  }
  return result;
}

function logCompressionResult(
  type: MediaAsset['type'],
  originalBytes: number,
  compressedBytes: number
) {
  const toMb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);
  const reducedPercent =
    originalBytes > 0
      ? (((originalBytes - compressedBytes) / originalBytes) * 100).toFixed(1)
      : '0';
  console.log(
    `[compressMedia] type=${type} original=${toMb(originalBytes)}MB → compressed=${toMb(compressedBytes)}MB (${reducedPercent}% 감소)`
  );
}

async function compressImage(
  localUri: string,
  originalSize: number,
  originalMimeType?: string,
  maxWidth = 1080
): Promise<CompressedMedia> {
  const probe = await ImageManipulator.manipulate(localUri).renderAsync();
  const context = ImageManipulator.manipulate(localUri);
  if (probe.width > maxWidth) {
    context.resize({ width: maxWidth });
  }
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    compress: 0.8,
    format: SaveFormat.JPEG,
  });
  const contentLength = await getFileSize(result.uri);

  const isSafeToKeepOriginal = originalMimeType != null;
  if (isSafeToKeepOriginal && contentLength >= originalSize) {
    return {
      uri: localUri,
      contentType: originalMimeType!,
      contentLength: originalSize,
      width: probe.width,
      height: probe.height,
    };
  }
  return {
    uri: result.uri,
    contentType: 'image/jpeg',
    contentLength,
    width: image.width,
    height: image.height,
  };
}

// 동영상인 경우: 압축은 하지 않고 길이/용량만 검증한다 (제한 방식으로 결정됨).
// 실제 압축은 네이티브 인코딩이 필요해 Dev Client 전환이 선행돼야 함 — 현재 범위 밖.
// duration은 플랫폼에 따라 피커가 못 채워줄 수 있어(특히 웹), 값이 없으면 길이 검증은 건너뛴다.
async function prepareVideo(
  asset: MediaAsset,
  originalSize: number
): Promise<CompressedMedia> {
  if (
    asset.durationMs != null &&
    asset.durationMs > MAX_VIDEO_DURATION_SEC * 1000
  ) {
    const seconds = (asset.durationMs / 1000).toFixed(1);
    throw new Error(
      `동영상 길이(${seconds}초)가 최대 허용 길이(${MAX_VIDEO_DURATION_SEC}초)를 초과합니다.`
    );
  }
  return {
    uri: asset.uri,
    contentType: asset.mimeType ?? 'video/mp4',
    contentLength: originalSize,
    width: null,
    height: null,
  };
}

async function getFileSize(uri: string): Promise<number> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    return blob.size;
  }
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists ? info.size : 0;
}
