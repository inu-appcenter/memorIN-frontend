import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MAX_VIDEO_DURATION_SEC } from '../lib/compressMedia';
import i18next from '@/shared/lib/i18n';

export interface PickedMediaAsset {
  uri: string;
  type: 'image' | 'video';
  mimeType?: string;
  fileName?: string;
  durationMs?: number | null;
  // 동영상은 압축 단계에서 크기를 알 수 없어 여기서 받은 값을 끝까지 들고 간다.
  width?: number | null;
  height?: number | null;
}

// 게시물 하나에 미디어 하나다. 오전 기록과 오후 기록은 각각 별도 게시물이다.
// 백엔드는 10개까지 허용하지만 화면 정책이 더 좁다.
const MAX_ATTACHMENTS = 1;

// 웹에서는 동영상 크기를 0으로 주는 경우가 있어 유효한 값만 남긴다.
function positiveOrNull(value: number | undefined): number | null {
  return typeof value === 'number' && value > 0 ? value : null;
}

export function useMediaPicker() {
  const [assets, setAssets] = useState<PickedMediaAsset[]>([]);

  const pickAssets = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        i18next.t('upload.permissionTitle'),
        i18next.t('upload.permissionMessage')
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: MAX_ATTACHMENTS > 1,
      selectionLimit: MAX_ATTACHMENTS,
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
      width: positiveOrNull(asset.width),
      height: positiveOrNull(asset.height),
    }));

    // 상한을 넘으면 나중에 고른 것을 남긴다. 1장 정책에서는 이 경로가 "변경"이 된다.
    setAssets((prev) => [...prev, ...picked].slice(-MAX_ATTACHMENTS));
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
