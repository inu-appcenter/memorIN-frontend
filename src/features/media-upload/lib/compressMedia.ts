import { Platform } from 'react-native';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Video } from 'react-native-compressor';
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

// 동영상 압축: 네이티브(Android/iOS)에서는 react-native-compressor로 실제 하드웨어 압축을 수행한다.
// 웹은 이 라이브러리가 지원되지 않아 길이/용량 가드레일만 적용하고 원본을 그대로 사용한다.
async function prepareVideo(
  asset: MediaAsset,
  originalSize: number
): Promise<CompressedMedia> {
  const durationMs =
    asset.durationMs ?? (await probeVideoDurationMs(asset.uri));
  if (durationMs != null && durationMs > MAX_VIDEO_DURATION_SEC * 1000) {
    const seconds = (durationMs / 1000).toFixed(1);
    throw new Error(
      `동영상 길이(${seconds}초)가 최대 허용 길이(${MAX_VIDEO_DURATION_SEC}초)를 초과합니다.`
    );
  }

  if (Platform.OS === 'web') {
    return {
      uri: asset.uri,
      contentType: asset.mimeType ?? 'video/mp4',
      contentLength: originalSize,
      width: null,
      height: null,
    };
  }

  const compressedUri = await Video.compress(
    asset.uri,
    { compressionMethod: 'auto' },
    (progress) => {
      console.log(
        `[compressMedia] video compress progress: ${(progress * 100).toFixed(0)}%`
      );
    }
  );
  const contentLength = await getFileSize(compressedUri);

  // 드물게 압축 결과가 원본보다 큰 경우 원본을 그대로 사용
  if (contentLength >= originalSize) {
    return {
      uri: asset.uri,
      contentType: asset.mimeType ?? 'video/mp4',
      contentLength: originalSize,
      width: null,
      height: null,
    };
  }
  return {
    uri: compressedUri,
    contentType: 'video/mp4',
    contentLength,
    width: null,
    height: null,
  };
}

// 웹에서는 ImagePicker가 duration을 채워주지 않는 경우가 많아, HTML5 video 엘리먼트로
// 메타데이터를 직접 읽어 보정한다. 네이티브는 asset.duration이 이미 채워져 있어 호출되지 않는다.
async function probeVideoDurationMs(uri: string): Promise<number | null> {
  if (Platform.OS !== 'web') return null;
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve(Number.isFinite(video.duration) ? video.duration * 1000 : null);
    };
    video.onerror = () => resolve(null);
    video.src = uri;
  });
}

async function getFileSize(uri: string): Promise<number> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    return blob.size;
  }
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists ? info.size : 0;
}
