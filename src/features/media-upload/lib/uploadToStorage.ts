import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import type { PresignedUpload } from '@/features/media-upload/api/mediaApi';
import i18next from '@/shared/lib/i18n';
import { createAbortError, createDeadline, type Deadline } from './abortable';

// 저장소 업로드 제한 시간. 크기와 상관없는 고정값이면 웹에서 압축 없이 올리는 최대
// 50MiB 영상이 느린 회선에서 정상 업로드 중에 끊긴다(120초 안에 끝내려면 약 3.5Mbps가
// 계속 나와야 한다). 최저 처리량을 1Mbps(128KiB/s)로 보고 크기에 비례해 늘리되, 작은
// 파일도 연결 수립과 지연을 감안해 120초는 준다. 50MiB면 약 400초다.
const MIN_UPLOAD_TIMEOUT_MS = 120_000;
const MIN_UPLOAD_THROUGHPUT_BYTES_PER_SEC = 128 * 1024;

export function storageUploadTimeoutMs(contentLength: number): number {
  return Math.max(
    MIN_UPLOAD_TIMEOUT_MS,
    Math.ceil((contentLength / MIN_UPLOAD_THROUGHPUT_BYTES_PER_SEC) * 1000)
  );
}

// 타임아웃이면 안내 문구로, 사용자 취소면 AbortError로 바꾼다. 둘 다 아니면 원래 오류다.
function toUploadError(deadline: Deadline, error: unknown): unknown {
  if (deadline.timedOut) return new Error(i18next.t('upload.timeout'));
  if (deadline.signal.aborted) return createAbortError();
  return error;
}

export async function uploadToStorage(
  presigned: PresignedUpload,
  fileUri: string,
  options: { contentLength: number; signal?: AbortSignal }
): Promise<void> {
  const deadline = createDeadline(
    options.signal,
    storageUploadTimeoutMs(options.contentLength)
  );
  try {
    if (Platform.OS === 'web') {
      await uploadOnWeb(presigned, fileUri, deadline.signal);
    } else {
      await uploadOnNative(presigned, fileUri, deadline.signal);
    }
  } catch (error) {
    throw toUploadError(deadline, error);
  } finally {
    deadline.clear();
  }
}

// 웹: Blob을 fetch body로 업로드한다.
async function uploadOnWeb(
  presigned: PresignedUpload,
  fileUri: string,
  signal: AbortSignal
): Promise<void> {
  let res: Response;
  try {
    const blob = await (await fetch(fileUri, { signal })).blob();
    res = await fetch(presigned.uploadUrl, {
      method: presigned.method, // PUT
      headers: presigned.requiredHeaders,
      body: blob,
      signal,
    });
  } catch (error) {
    // fetch는 연결 실패를 브라우저마다 다른 영어 문구(Failed to fetch 등)로 던진다.
    // 취소·타임아웃은 호출부가 가리므로 그대로 넘긴다.
    if (signal.aborted) throw error;
    throw new Error(i18next.t('error.network'));
  }
  if (!res.ok) {
    throw new Error(i18next.t('upload.uploadFailed', { status: res.status }));
  }
}

// 네이티브(Android/iOS): 파일을 스트리밍 PUT한다. uploadAsync는 중간에 멈출 방법이
// 없어 취소할 수 있는 업로드 작업을 만든다.
async function uploadOnNative(
  presigned: PresignedUpload,
  fileUri: string,
  signal: AbortSignal
): Promise<void> {
  const task = FileSystem.createUploadTask(presigned.uploadUrl, fileUri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: presigned.requiredHeaders,
  });
  const cancel = () => {
    task.cancelAsync().catch(() => {});
  };
  if (signal.aborted) throw createAbortError();
  signal.addEventListener('abort', cancel);
  try {
    let result: Awaited<ReturnType<typeof task.uploadAsync>>;
    try {
      result = await task.uploadAsync();
    } catch (error) {
      // 연결 실패는 네이티브 모듈의 영어 오류 문구로 온다. 안내 문구로 바꾼다.
      if (signal.aborted) throw error;
      throw new Error(i18next.t('error.network'));
    }
    // 취소된 작업은 결과 없이 끝날 수 있다. 사용자 취소인지 타임아웃인지는 호출부가 가린다.
    if (signal.aborted) throw createAbortError();
    if (!result) {
      throw new Error(i18next.t('upload.uploadFailed', { status: 0 }));
    }
    if (result.status < 200 || result.status >= 300) {
      throw new Error(
        i18next.t('upload.uploadFailed', { status: result.status })
      );
    }
  } finally {
    signal.removeEventListener('abort', cancel);
  }
}
