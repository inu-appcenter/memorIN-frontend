import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MAX_VIDEO_DURATION_SEC } from '../lib/compressMedia';

export interface PickedMediaAsset {
  uri: string;
  type: 'image' | 'video';
  mimeType?: string;
  fileName?: string;
  durationMs?: number | null;
}

const MAX_ATTACHMENTS = 10;

export function useMediaPicker() {
  const [assets, setAssets] = useState<PickedMediaAsset[]>([]);

  const pickAssets = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진/동영상 접근 권한을 허용해주세요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_ATTACHMENTS - assets.length,
      videoMaxDuration: MAX_VIDEO_DURATION_SEC, // 갤러리 선택에는 강제되지 않는 경우가 많은 참고용 힌트.
      // 실제 강제 검증은 compressMedia의 prepareVideo에서 한다.
      quality: 1,
    });
    if (result.canceled) return;

    const picked: PickedMediaAsset[] = result.assets.map((asset) => ({
      uri: asset.uri,
      type: asset.type === 'video' ? 'video' : 'image',
      mimeType: asset.mimeType,
      fileName: asset.fileName ?? undefined,
      durationMs: asset.duration ?? undefined,
    }));
    setAssets((prev) => [...prev, ...picked].slice(0, MAX_ATTACHMENTS));
  };

  const removeAsset = (uri: string) => {
    setAssets((prev) => prev.filter((asset) => asset.uri !== uri));
  };

  return {
    assets,
    pickAssets,
    removeAsset,
    maxAttachments: MAX_ATTACHMENTS,
    canAddMore: assets.length < MAX_ATTACHMENTS,
  };
}
