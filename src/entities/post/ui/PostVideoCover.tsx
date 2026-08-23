import { memo, useEffect, useState } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';

const MIN_VALID_DURATION_MS = 1000; // 이보다 짧으면 메타데이터 로딩 중인 값으로 간주하고 무시

interface PostVideoCoverProps {
  uri: string;
  isVisible: boolean;
  // 기본 false. 진행바·시간·볼륨 같은 네이티브 UI가 콘텐츠를 덮지 않게
  // 기본값을 꺼두고, 필요한 곳에서만 명시적으로 켠다.
  nativeControls?: boolean;
  // 탭으로 재생/일시정지를 토글할지. 피드·게시물 상세처럼 사용자가 직접
  // 제어하는 곳에서만 켠다. 스토리뷰어는 자체 진행 로직이 있어 끈다.
  showPlayPauseToggle?: boolean;
  onDurationLoaded?: (durationMs: number) => void; // 스토리 뷰어 진행바용
  style?: StyleProp<ViewStyle>; // 기본은 피드 카드 크기, 썸네일 등에서 오버라이드
}

// 피드에서 카드가 뷰포트에 80% 이상 들어오면 자동 재생, 벗어나면 정지한다.
// 브라우저/OS 자동재생 정책상 muted 상태에서만 자동재생이 허용되므로 음소거로 재생한다.
function PostVideoCoverComponent({
  uri,
  isVisible,
  nativeControls = false,
  showPlayPauseToggle = false,
  onDurationLoaded,
  style,
}: PostVideoCoverProps) {
  const { t } = useTranslation();
  const [pausedByUser, setPausedByUser] = useState(false);

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
    // 뷰포트를 드나들면 수동 일시정지 상태는 초기화한다. 스크롤로 지나쳤다가
    // 다시 돌아왔을 때 멈춰 있으면 고장난 것처럼 보인다.
    setPausedByUser(false);
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

  const handleTogglePlay = () => {
    if (pausedByUser) {
      player.play();
      setPausedByUser(false);
      return;
    }
    player.pause();
    setPausedByUser(true);
  };

  const video = (
    <VideoView
      player={player}
      style={style ?? { height: 360, width: '100%' }}
      contentFit="cover"
      nativeControls={nativeControls}
    />
  );

  if (!showPlayPauseToggle) return video;

  return (
    <Pressable
      onPress={handleTogglePlay}
      accessibilityRole="button"
      accessibilityLabel={t('post.playVideo')}
      style={{ position: 'relative' }}
    >
      {video}
      {/* 일시정지일 때만 표시한다. 재생 중에 아이콘이 남아 있으면
          "누르면 재생된다"는 잘못된 신호를 준다. */}
      {pausedByUser && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View className="h-[56px] w-[56px] items-center justify-center rounded-full bg-black/50">
            <Text className="text-[22px] leading-[22px] text-white">▶</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

// 동영상 플레이어 재생성 방지를 위해 memo 적용
export const PostVideoCover = memo(PostVideoCoverComponent);
