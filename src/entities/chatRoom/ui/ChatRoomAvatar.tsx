import { View } from 'react-native';

// 프로필 이미지 연동 전까지 쓰는 자리표시 색. 시안의 두 원 색을 근사한다.
// 실제 이미지가 붙으면(별도 이슈) 이 상수는 사라진다.
const GROUP_AVATAR_COLORS = ['#F3C9B8', '#BCCFEA'] as const;
const SOLO_AVATAR_COLOR = '#EDEEF2';

interface ChatRoomAvatarProps {
  isGroup: boolean;
  size?: number;
}

// 1:1은 원 하나, 그룹은 원 두 개가 겹친 형태로 그린다.
export function ChatRoomAvatar({ isGroup, size = 48 }: ChatRoomAvatarProps) {
  if (!isGroup) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: SOLO_AVATAR_COLOR,
        }}
      />
    );
  }

  // 겹친 두 원이 size 안에 들어오도록 지름을 줄이고 대각선으로 어긋나게 배치한다.
  const circle = size * 0.66;
  const offset = size - circle;

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: circle,
          height: circle,
          borderRadius: circle / 2,
          backgroundColor: GROUP_AVATAR_COLORS[0],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: offset,
          top: offset,
          width: circle,
          height: circle,
          borderRadius: circle / 2,
          backgroundColor: GROUP_AVATAR_COLORS[1],
        }}
      />
    </View>
  );
}
