import { Text } from '@/shared/ui/text';
import { Link } from 'expo-router';
import { View } from 'react-native';
import { useMyProfile } from '@/entities/session/model/useMyProfile';

// 피드페이지 우측에 렌더링되는 패널.
//
// "추천 친구" 섹션은 원래 shared/config/dummy.ts의 하드코딩 배열이었다. 백엔드에
// 추천 알고리즘/API가 아직 없어서(설계안 4.6 참고) 실제 데이터로 채울 수 없다 —
// 한때 팔로잉 미리보기로 대체했었는데, 그건 "추천"이 아니라 "이미 팔로우 중인
// 사람"이라 의미가 달라서 걷어내고 placeholder로 되돌렸다. 추천 API가 생기면
// 이 자리를 실제 데이터로 채운다.
export function RightPanel() {
  const { data: profile } = useMyProfile();

  return (
    <View className="hidden w-[320px] border-l border-border p-lg desktop:flex">
      <View className="mb-xl flex-row items-center justify-between">
        <View className="flex-row items-center gap-md">
          <View className="h-[48px] w-[48px] rounded-full border border-border bg-subtle" />
          <View>
            <Text className="font-bold">{profile?.username ?? '내 계정'}</Text>
            <Text className="text-muted">{profile?.displayName ?? ''}</Text>
          </View>
        </View>
        {/* 프로필 페이지로 리다이렉팅 */}
        <Link href="/profile">
          <Text className="font-bold text-link">내 프로필</Text>
        </Link>
      </View>

      <View className="mb-md flex-row justify-between">
        <Text className="font-bold text-secondary">추천 친구</Text>
        <Link href="/social">
          <Text className="text-secondary">모두 보기</Text>
        </Link>
      </View>
      <Text className="text-muted">추천 기능은 아직 준비 중이에요</Text>
    </View>
  );
}
