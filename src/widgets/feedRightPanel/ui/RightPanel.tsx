import { Text } from '@/shared/ui/text';
import { Link } from 'expo-router';
import { View } from 'react-native';
import { dummyPeopleArray } from '@/shared/config/dummy';

// 피드페이지 우측에 렌더링 되는 패널
// 서버로부터 유저 정보를 가져와서 뿌려줘야 함
export function RightPanel() {
  return (
    <View className="hidden w-[320px] border-l border-border p-lg desktop:flex">
      <View className="mb-xl flex-row items-center justify-between">
        <View className="flex-row items-center gap-md">
          <View className="h-[48px] w-[48px] rounded-full border border-border bg-subtle" />
          <View>
            <Text className="font-bold">yujeong737</Text>
            <Text className="text-muted">박지호</Text>
          </View>
        </View>
        {/* 프로필 페이지로 리다이렉팅 */}
        <Link href="/profile">
          <Text className="font-bold text-link">내 프로필</Text>
        </Link>
      </View>
      <View className="mb-md flex-row justify-between">
        <Text className="font-bold text-secondary">추천 친구</Text>
        <Text className="text-secondary">모두 보기</Text>
      </View>
      {dummyPeopleArray.map((name) => (
        <View
          key={name}
          className="mb-lg flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-md">
            <View className="h-[42px] w-[42px] rounded-full bg-subtle" />
            <View>
              <Text className="font-bold">{name}</Text>
              <Text className="text-muted">새로운 친구</Text>
            </View>
          </View>
          <Text className="font-bold text-link">추가</Text>
        </View>
      ))}
    </View>
  );
}
