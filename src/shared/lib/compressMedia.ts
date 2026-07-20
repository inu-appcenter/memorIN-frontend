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

// 이미지인 경우: 압축
async function compressImage(
  localUri: string,
  maxWidth = 1080
): Promise<CompressedMedia> {
  const context = ImageManipulator.manipulate(localUri);
  context.resize({ width: maxWidth });
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    compress: 0.8,
    format: SaveFormat.JPEG,
  });

  const contentLength = await getFileSize(result.uri);
  return { uri: result.uri, contentType: 'image/jpeg', contentLength };
}

// 동영상인 경우: 압축 없이 크기만 측정
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
