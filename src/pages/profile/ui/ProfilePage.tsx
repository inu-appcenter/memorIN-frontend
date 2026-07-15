import { ScrollView, View } from 'react-native';
import { Text } from '@/shared/ui/text';

const records = Array.from({ length: 15 }, (_, index) => index);

export function ProfilePage() {
  return (
    <View className="flex-1 bg-page">
      <View className="h-[62px] flex-row items-center justify-between border-b border-border px-lg">
        <Text variant="h1">프로필</Text>
        <Text className="text-[24px]">⚙</Text>
      </View>
      <ScrollView className="flex-1">
        <View className="mx-auto w-full max-w-[720px] p-lg">
          <View className="flex-row gap-xl border-b border-border pb-xl">
            <View className="h-[110px] w-[110px] rounded-full bg-subtle" />
            <View className="flex-1 gap-md">
              <View className="flex-row flex-wrap items-center gap-lg">
                <View>
                  <Text variant="h1">inu1234</Text>
                  <Text className="text-muted">박지호</Text>
                </View>
                <View className="rounded-md border border-border px-xl py-sm">
                  <Text className="font-bold">프로필 편집</Text>
                </View>
                <View className="rounded-md border border-border px-xl py-sm">
                  <Text className="font-bold">친구 관리</Text>
                </View>
              </View>
              <View className="flex-row gap-xl">
                {[
                  ['46', '기록'],
                  ['43', '친구'],
                  ['128', '받은 반응'],
                ].map(([count, label]) => (
                  <View key={label} className="items-center">
                    <Text className="text-[20px] font-bold">{count}</Text>
                    <Text className="text-muted">{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <Text className="my-lg font-bold">내 기록</Text>
          <View className="flex-row flex-wrap gap-sm">
            {records.map((item) => (
              <View
                key={item}
                className="aspect-square min-w-[120px] flex-1 basis-[23%] items-center justify-center rounded-md border border-dashed border-border bg-surface"
              >
                <Text className="text-tertiary">IMG</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
