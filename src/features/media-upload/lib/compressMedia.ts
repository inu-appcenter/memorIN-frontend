import { Platform } from 'react-native';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Video, getVideoMetaData } from 'react-native-compressor';
import * as FileSystem from 'expo-file-system/legacy';
import i18next from '@/shared/lib/i18n';
import { stripVideoMetadata } from './stripVideoMetadata';

// 백엔드 MINIO_MAX_UPLOAD_SIZE_BYTES 기본값과 동일 (50MiB)
const MAX_UPLOAD_SIZE_BYTES = 52428800;

// 백엔드 MINIO_ALLOWED_CONTENT_TYPES 기본값과 같은 형식만 올린다. 그 밖의 형식은 presigned
// URL 발급이 400으로 실패하는데, 그 전에 무엇이 문제인지 알려 준다.
// 이미지는 다시 인코딩한 결과(JPEG·PNG)나 그대로 올리는 GIF만 나가므로 따로 목록을 두지 않는다.
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime']);

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
  // uri를 이 함수에서 새로 만든 경우(웹 blob URL) 업로드가 끝나면 불러 메모리를 놓는다.
  release?: () => void;
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

  try {
    assertWithinSizeLimit(result.contentLength);
  } catch (error) {
    result.release?.();
    throw error;
  }
  return result;
}

function assertWithinSizeLimit(contentLength: number): void {
  if (contentLength > MAX_UPLOAD_SIZE_BYTES) {
    const sizeMb = (contentLength / (1024 * 1024)).toFixed(1);
    throw new Error(i18next.t('upload.fileTooLarge', { sizeMb }));
  }
}

function unsupportedFormatError(): Error {
  return new Error(i18next.t('upload.unsupportedFormat'));
}

// 사진은 항상 다시 인코딩한다. 원본에는 EXIF(촬영 위치·기기 정보)가 들어 있고, 다시
// 인코딩한 결과에는 남지 않는다. HEIC·AVIF처럼 서버가 받지 않는 형식도 이 과정에서
// JPEG가 된다. 원본이 더 작더라도 원본을 올리지 않는다.
// GIF만 원본을 올린다. 다시 인코딩하면 첫 프레임만 남고, 위치 정보를 담는 형식이 아니다.
async function compressImage(
  localUri: string,
  originalSize: number,
  originalMimeType?: string,
  maxWidth = 1080
): Promise<CompressedMedia> {
  let probe: { width: number; height: number };
  try {
    probe = await ImageManipulator.manipulate(localUri).renderAsync();
  } catch {
    // 이 기기(웹이면 브라우저)가 읽지 못하는 형식이다. 예: Chrome의 HEIC.
    throw unsupportedFormatError();
  }

  if (originalMimeType === 'image/gif') {
    return {
      uri: localUri,
      contentType: 'image/gif',
      contentLength: originalSize,
      width: probe.width,
      height: probe.height,
    };
  }

  const context = ImageManipulator.manipulate(localUri);
  if (probe.width > maxWidth) {
    context.resize({ width: maxWidth });
  }
  const image = await context.renderAsync();
  // PNG는 투명 배경이 있을 수 있어 PNG로 둔다. JPEG로 바꾸면 투명한 곳이 검게 칠해진다.
  const keepPng = originalMimeType === 'image/png';
  const result = await image.saveAsync({
    compress: 0.8,
    format: keepPng ? SaveFormat.PNG : SaveFormat.JPEG,
  });
  const contentLength = await getFileSize(result.uri);
  return {
    uri: result.uri,
    contentType: keepPng ? 'image/png' : 'image/jpeg',
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
  if (Platform.OS === 'web') {
    return prepareVideoOnWeb(asset, originalSize);
  }

  // ImagePicker가 길이를 못 준 경우(0·null) 파일에서 다시 읽는다. 그래도 모르면
  // 15초 제한을 확인할 수 없으므로 거부한다.
  const durationMs =
    positiveOrNull(asset.durationMs) ?? (await readNativeDurationMs(asset.uri));
  if (durationMs == null) {
    throw new Error(i18next.t('upload.videoDurationUnknown'));
  }
  assertWithinDurationLimit(durationMs);

  const compressedUri = await Video.compress(asset.uri, {
    compressionMethod: 'manual',
    stripAudio: true,
    maxSize: VIDEO_MAX_SIZE_PX,
  });
  // 조각난(fragmented) MP4는 Android가 첫 조각 길이만 읽어 20초 영상을 0.89초로 알려 준다.
  // 압축 결과는 보통 MP4라 길이가 바르게 들어 있어 한 번 더 확인한다.
  const compressedDurationMs = await readNativeDurationMs(compressedUri);
  if (compressedDurationMs != null) {
    assertWithinDurationLimit(compressedDurationMs);
  }
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

function positiveOrNull(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function assertWithinDurationLimit(durationMs: number): void {
  if (durationMs > MAX_VIDEO_DURATION_SEC * 1000) {
    const seconds = (durationMs / 1000).toFixed(1);
    throw new Error(
      i18next.t('upload.videoTooLong', {
        seconds,
        max: MAX_VIDEO_DURATION_SEC,
      })
    );
  }
}

// 네이티브 전용. react-native-compressor의 getVideoMetaData는 길이를 초 단위로 준다.
async function readNativeDurationMs(uri: string): Promise<number | null> {
  try {
    const { duration } = await getVideoMetaData(uri);
    const seconds = positiveOrNull(Number(duration));
    return seconds == null ? null : seconds * 1000;
  } catch {
    return null;
  }
}

// 웹은 영상을 압축하지 않고 원본을 올린다. 형식 → 크기 → 길이 순으로 확인한다. 원본
// 크기가 곧 올릴 크기라 길이를 재기 전에 거를 수 있다.
async function prepareVideoOnWeb(
  asset: MediaAsset,
  originalSize: number
): Promise<CompressedMedia> {
  // mimeType이 없으면 MP4로 보고, 아래에서 MP4·MOV 구조인지 직접 확인한다.
  const contentType = asset.mimeType || 'video/mp4';
  if (!ALLOWED_VIDEO_TYPES.has(contentType)) {
    throw unsupportedFormatError();
  }
  assertWithinSizeLimit(originalSize);

  // 웹 ImagePicker의 duration은 video.duration을 그대로 넣어 단위가 초이고, 길이를 모르면
  // Infinity, 읽지 못하면 0이다(네이티브는 밀리초). 이 값을 쓰지 않고 직접 잰다.
  const durationMs = await probeVideoDurationMs(asset.uri);
  if (durationMs == null) {
    throw new Error(i18next.t('upload.videoDurationUnknown'));
  }
  assertWithinDurationLimit(durationMs);

  const bytes = new Uint8Array(await (await fetch(asset.uri)).arrayBuffer());
  const { valid } = stripVideoMetadata(bytes);
  if (!valid) {
    throw unsupportedFormatError();
  }
  const uri = URL.createObjectURL(new Blob([bytes], { type: contentType }));
  return {
    uri,
    contentType,
    // 상자 이름만 바꿔 크기는 원본과 같다.
    contentLength: bytes.byteLength,
    width: asset.width ?? null,
    height: asset.height ?? null,
    release: () => URL.revokeObjectURL(uri),
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
