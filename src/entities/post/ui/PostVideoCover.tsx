import { useEffect } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';

interface PostVideoCoverProps {
  uri: string;
  isVisible: boolean;
}

// 피드에서 카드가 뷰포트에 60% 이상 들어오면 자동 재생, 벗어나면 정지한다.
// 브라우저/OS 자동재생 정책상 muted 상태에서만 자동재생이 허용되므로 음소거로 재생한다.
export function PostVideoCover({ uri, isVisible }: PostVideoCoverProps) {
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

  return (
    <VideoView
      player={player}
      style={{ height: 360, width: '100%' }}
      contentFit="cover"
      nativeControls
    />
  );
}
