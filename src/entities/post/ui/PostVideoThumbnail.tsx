import { useEffect, useState } from 'react';
import { Platform, type StyleProp } from 'react-native';
import { useVideoPlayer, type VideoThumbnail } from 'expo-video';
import { Image, type ImageStyle } from 'expo-image';
import { PostVideoCover } from './PostVideoCover';

interface PostVideoThumbnailProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
}

// 재생하지 않고 정지 프레임 한 장만 뽑아서 보여준다. 달력 상세 패널처럼
// 여러 개가 한 화면에 동시에 뜰 수 있는 자리에서 진짜 비디오 플레이어/서피스를
// 띄우지 않기 위한 용도 — PostVideoCover(재생용)와는 별도 컴포넌트.
// 웹은 <video>가 play() 없이도 첫 프레임을 그려주므로 generateThumbnailsAsync가
// 필요 없고(아직 웹 미지원이기도 함), 네이티브만 실제 썸네일을 생성한다.
export function PostVideoThumbnail({ uri, style }: PostVideoThumbnailProps) {
  if (Platform.OS === 'web') {
    return (
      <PostVideoCover
        uri={uri}
        isVisible={false}
        nativeControls={false}
        style={style}
      />
    );
  }
  return <NativeVideoThumbnail uri={uri} style={style} />;
}

function NativeVideoThumbnail({ uri, style }: PostVideoThumbnailProps) {
  const [thumbnail, setThumbnail] = useState<VideoThumbnail | null>(null);
  const player = useVideoPlayer(uri);

  useEffect(() => {
    let cancelled = false;
    player
      .generateThumbnailsAsync(0, { maxWidth: 240 })
      .then(([result]) => {
        if (!cancelled && result) setThumbnail(result);
      })
      .catch(() => {
        // 실패하면 빈 자리로 둔다 — 호출부의 재생 아이콘 오버레이만 남음
      });
    return () => {
      cancelled = true;
    };
  }, [player]);

  if (!thumbnail) return null;

  return <Image source={thumbnail} style={style} contentFit="cover" />;
}