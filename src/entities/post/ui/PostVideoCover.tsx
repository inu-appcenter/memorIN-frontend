import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { createVideoPlayer, VideoView, type VideoPlayer } from 'expo-video';
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

// 다 쓴 플레이어를 release하기까지 기다리는 시간. 새 구조(Fabric)에서는 JS가 커밋한 속성을
// UI 스레드가 나중에 적용한다. JS에서 커밋 뒤에 바로 release하면, UI 스레드가 밀려 있을 때
// 이미 release된 플레이어가 뒤늦게 VideoView에 적용되어 "Cannot use shared object that was
// already released"가 난다(에뮬레이터에서 약 2초 밀렸다). 다 쓴 플레이어는 바로 멈추고
// release는 UI 스레드가 따라잡을 시간을 두고 한다.
const PLAYER_RELEASE_DELAY_MS = 5000;

// presigned URL에서 서명(쿼리)을 뗀 파일 경로
function mediaPath(uri: string): string {
  const queryStart = uri.indexOf('?');
  return queryStart === -1 ? uri : uri.slice(0, queryStart);
}

// 미디어 URL은 presigned라 재조회마다 서명이 바뀐다. expo-video의 useVideoPlayer는 source가
// 바뀌면 렌더 도중에 이전 플레이어를 release하고 새로 만들어, 피드를 다시 불러올 때마다 모든
// 영상을 다시 받고 위의 오류도 낸다. 같은 파일이면 처음 받은 URL의 플레이어를 계속 쓴다.
// 커밋되지 않고 버려진 렌더에서 만든 플레이어는 놓지 못하지만, 이 화면에는 렌더를 버리는
// Suspense·transition이 없다.
function usePostVideoPlayer(uri: string): VideoPlayer {
  const path = mediaPath(uri);
  const player = useMemo(
    () => {
      const created = createVideoPlayer(uri);
      created.loop = true;
      created.muted = true;
      return created;
    },
    // 서명만 바뀐 uri로는 다시 만들지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path]
  );
  useEffect(
    () => () => {
      player.pause();
      setTimeout(() => player.release(), PLAYER_RELEASE_DELAY_MS);
    },
    [player]
  );
  return player;
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

  const player = usePostVideoPlayer(uri);

  // 처음 받은 URL은 5분 뒤 만료된다. 반복 재생 중 다시 받으려다 실패하면 플레이어가 error
  // 상태로 멈추므로, 재조회로 새 URL이 오면 그 URL로 바꿔 다시 재생한다.
  const retriedUriRef = useRef<string | null>(null);
  useEffect(() => {
    if (player.status !== 'error' || retriedUriRef.current === uri) return;
    retriedUriRef.current = uri;
    player
      .replaceAsync(uri)
      .then(() => {
        if (isVisible) player.play();
      })
      .catch(() => {});
  }, [uri, player, isVisible]);

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
