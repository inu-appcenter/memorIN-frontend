import { Platform } from 'react-native';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Video } from 'react-native-compressor';
import * as FileSystem from 'expo-file-system/legacy';
import i18next from '@/shared/lib/i18n';

// 백엔드 MINIO_MAX_UPLOAD_SIZE_BYTES 기본값과 동일 (50MiB)
const MAX_UPLOAD_SIZE_BYTES = 52428800;

// 갤러리 선택(launchImageLibraryAsync) 파일 검증
export const MAX_VIDEO_DURATION_SEC = 15;

// Video.compress에 넘기는 값과 크기 계산이 어긋나면 서버에 잘못된 비율이 올라간다.
// 한 상수를 양쪽에서 쓴다.
const VIDEO_MAX_SIZE_PX = 1080;

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
  width?: number | null;
  height?: number | null;
}

export async function compressMedia(
  asset: MediaAsset
): Promise<CompressedMedia> {
  const originalSize = await getFileSize(asset.uri);

  const result =
    asset.type === 'video'
      ? await prepareVideo(asset, originalSize)
      : await compressImage(asset.uri, originalSize, asset.mimeType);

  if (result.contentLength > MAX_UPLOAD_SIZE_BYTES) {
    const sizeMb = (result.contentLength / (1024 * 1024)).toFixed(1);
    throw new Error(i18next.t('upload.fileTooLarge', { sizeMb }));
  }
  return result;
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

// Video.compress의 maxSize는 긴 변 기준이다. 비율을 유지한 채 긴 변만 줄이므로
// 같은 계산으로 결과 크기를 미리 구할 수 있다.
function scaleToMaxSize(
  width: number | null | undefined,
  height: number | null | undefined,
  maxSize: number
): { width: number | null; height: number | null } {
  if (!width || !height) return { width: null, height: null };
  const longest = Math.max(width, height);
  if (longest <= maxSize) return { width, height };
  const ratio = maxSize / longest;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

// 동영상 압축: 네이티브(Android/iOS)에서는 react-native-compressor로 실제 하드웨어 압축을 수행한다.
// 웹은 이 라이브러리가 지원되지 않아 길이/용량 가드레일만 적용하고 원본을 그대로 사용한다.
//
// 크기는 압축 결과에서 읽을 방법이 없어 선택 시점(ImagePicker)의 값으로 계산한다.
// 이 값이 없으면 피드가 원본 비율을 못 써서 고정 높이로 떨어진다.
async function prepareVideo(
  asset: MediaAsset,
  originalSize: number
): Promise<CompressedMedia> {
  // 웹 ImagePicker의 duration은 video.duration을 그대로 넣어 단위가 초이고, 길이를 모르면
  // Infinity, 읽지 못하면 0이다(네이티브는 밀리초). 웹에서는 이 값을 쓰지 않고 직접 잰다.
  const durationMs =
    Platform.OS === 'web'
      ? await probeVideoDurationMs(asset.uri)
      : (asset.durationMs ?? null);
  // 길이를 모르면 15초 제한을 확인할 수 없으므로 웹에서는 거부한다. 네이티브는
  // ImagePicker 값을 그대로 쓰고, 값이 없으면 길이 검사를 건너뛴다.
  if (durationMs == null && Platform.OS === 'web') {
    throw new Error(i18next.t('upload.videoDurationUnknown'));
  }
  if (durationMs != null && durationMs > MAX_VIDEO_DURATION_SEC * 1000) {
    const seconds = (durationMs / 1000).toFixed(1);
    throw new Error(
      i18next.t('upload.videoTooLong', {
        seconds,
        max: MAX_VIDEO_DURATION_SEC,
      })
    );
  }

  if (Platform.OS === 'web') {
    // 원본을 그대로 올리므로 크기도 원본 그대로다.
    return {
      uri: asset.uri,
      contentType: asset.mimeType ?? 'video/mp4',
      contentLength: originalSize,
      width: asset.width ?? null,
      height: asset.height ?? null,
    };
  }

  const compressedUri = await Video.compress(asset.uri, {
    compressionMethod: 'manual',
    stripAudio: true,
    maxSize: VIDEO_MAX_SIZE_PX,
  });
  const contentLength = await getFileSize(compressedUri);
  const scaled = scaleToMaxSize(asset.width, asset.height, VIDEO_MAX_SIZE_PX);
  return {
    uri: compressedUri,
    contentType: 'video/mp4',
    contentLength,
    width: scaled.width,
    height: scaled.height,
  };
}

// 메타데이터를 끝내 못 읽는 파일이 있어서 기다리는 시간을 정해 둔다.
const PROBE_TIMEOUT_MS = 5000;

// 웹 전용. HTML5 video 엘리먼트로 길이를 읽는다. 못 읽으면 null이다.
async function probeVideoDurationMs(uri: string): Promise<number | null> {
  if (Platform.OS !== 'web') return null;
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  try {
    const seconds = await new Promise<number | null>((resolve) => {
      const timer = setTimeout(() => resolve(null), PROBE_TIMEOUT_MS);
      const finish = (value: number | null) => {
        clearTimeout(timer);
        resolve(value);
      };
      const finiteDuration = () =>
        Number.isFinite(video.duration) && video.duration > 0
          ? video.duration
          : null;

      video.onerror = () => finish(null);
      video.onloadedmetadata = () => {
        const duration = finiteDuration();
        if (duration != null) {
          finish(duration);
          return;
        }
        // MediaRecorder로 만든 WebM 등은 헤더에 길이가 없어 Infinity로 온다. 끝으로
        // 탐색하면 브라우저가 파일을 훑어 실제 길이를 durationchange로 알려 준다.
        video.ondurationchange = () => {
          const found = finiteDuration();
          if (found != null) finish(found);
        };
        video.onseeked = () => finish(finiteDuration());
        video.currentTime = Number.MAX_SAFE_INTEGER;
      };
      video.src = uri;
    });
    return seconds == null ? null : seconds * 1000;
  } finally {
    // src를 비우고 load()까지 해야 브라우저가 붙잡은 디코더와 버퍼를 놓는다.
    video.onloadedmetadata = null;
    video.ondurationchange = null;
    video.onseeked = null;
    video.onerror = null;
    video.removeAttribute('src');
    video.load();
  }
}

async function getFileSize(uri: string): Promise<number> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    return blob.size;
  }
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists ? info.size : 0;
}
