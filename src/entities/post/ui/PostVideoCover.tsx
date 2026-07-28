import { memo, useEffect } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import type { StyleProp, ViewStyle } from 'react-native';

const MIN_VALID_DURATION_MS = 1000; // 이보다 짧으면 메타데이터 로딩 중인 값으로 간주하고 무시

interface PostVideoCoverProps {
  uri: string;
  isVisible: boolean;
  nativeControls?: boolean; // 기본 true(피드), 스토리 뷰어/썸네일에서는 false로 넘김
  onDurationLoaded?: (durationMs: number) => void; // 스토리 뷰어 진행바용
  style?: StyleProp<ViewStyle>; // 기본은 피드 카드 크기, 썸네일 등에서 오버라이드
}

// 피드에서 카드가 뷰포트에 80% 이상 들어오면 자동 재생, 벗어나면 정지한다.
// 브라우저/OS 자동재생 정책상 muted 상태에서만 자동재생이 허용되므로 음소거로 재생한다.
function PostVideoCoverComponent({
  uri,
  isVisible,
  nativeControls = true,
  onDurationLoaded,
  style,
}: PostVideoCoverProps) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = true;
  });

  useEffect(() => {
    if (isVisible) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible, player]);

  useEffect(() => {
    if (!onDurationLoaded) return;
    const subscription = player.addListener('statusChange', ({ status }) => {
      const durationMs = player.duration * 1000;
      // readyToPlay가 메타데이터 완전 로드 전에도 한 번 더 올 수 있어서,
      // 말도 안 되게 짧은 값(1초 미만)은 아직 로딩 중인 것으로 보고 무시한다.
      if (
        status === 'readyToPlay' &&
        Number.isFinite(durationMs) &&
        durationMs >= MIN_VALID_DURATION_MS
      ) {
        onDurationLoaded(durationMs);
      }
    });
    return () => subscription.remove();
  }, [player, onDurationLoaded]);

  return (
    <VideoView
      player={player}
      style={style ?? { height: 360, width: '100%' }}
      contentFit="cover"
      nativeControls={nativeControls}
    />
  );
}

// 동영상 플레이어 재생성 방지를 위해 memo 적용
export const PostVideoCover = memo(PostVideoCoverComponent);
