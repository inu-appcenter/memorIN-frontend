import { Platform } from 'react-native';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

export interface CompressedMedia {
  uri: string;
  contentType: string;
  contentLength: number;
}

// picker(expo-image-picker)의 asset과 동일한 최소 형태
interface MediaAsset {
  uri: string;
  type: 'image' | 'video';
  mimeType?: string; // 동영상 원본 MIME (picker가 제공)
}

export async function compressMedia(
  asset: MediaAsset
): Promise<CompressedMedia> {
  if (asset.type === 'video') {
    return prepareVideo(asset);
  }
  return compressImage(asset.uri);
}

// 이미지인 경우: 압축 (압축 후 크기가 업스케일링 등의 이유로 원본보다 커지면 원본을 그대로 사용)
async function compressImage(
  localUri: string,
  originalMimeType?: string,
  maxWidth = 1080
): Promise<CompressedMedia> {
  const originalSize = await getFileSize(localUri);

  // 리사이즈 없이 렌더링해서 원본 width만 확인
  const probe = await ImageManipulator.manipulate(localUri).renderAsync();

  const context = ImageManipulator.manipulate(localUri);
  if (probe.width > maxWidth) {
    context.resize({ width: maxWidth }); // 원본이 더 클 때만 리사이즈
  }

  const image = await context.renderAsync();
  const result = await image.saveAsync({
    compress: 0.8,
    format: SaveFormat.JPEG,
  });

  const contentLength = await getFileSize(result.uri);

  // 압축 결과가 원본보다 크거나 같으면 압축 자체를 포기하고 원본 사용 (원본 대비 크기 가드)
  if (contentLength >= originalSize) {
    return {
      uri: localUri,
      contentType: originalMimeType ?? 'image/jpeg',
      contentLength: originalSize,
    };
  }

  return { uri: result.uri, contentType: 'image/jpeg', contentLength };
}

// 동영상인 경우: 압축 없이 크기만 측정 (동영상 압축 로직 추가예정)
async function prepareVideo(asset: MediaAsset): Promise<CompressedMedia> {
  const contentLength = await getFileSize(asset.uri);
  return {
    uri: asset.uri,
    contentType: asset.mimeType ?? 'video/mp4', // picker가 안 주면 mp4가 디폴트
    contentLength,
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
