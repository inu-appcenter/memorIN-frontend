import { ScrollView, View } from 'react-native';
import { Text } from '@/shared/ui/text';

export function UploadPage() {
  return (
    <View className="flex-1 bg-page">
      <View className="h-[62px] flex-row items-center justify-between border-b border-border px-lg">
        <Text variant="h1">‹ 기록 올리기</Text>
        <Text className="font-bold text-link">완료</Text>
      </View>
      <ScrollView className="flex-1" contentContainerClassName="mx-auto w-full max-w-[720px] gap-lg p-lg">
        <View className="h-[280px] items-center justify-center rounded-lg border border-dashed border-border bg-surface">
          <Text className="text-[40px] text-muted">＋</Text>
          <Text className="font-bold">사진 또는 영상 추가</Text>
          <Text className="text-muted">오늘의 순간을 담아보세요</Text>
        </View>
        <View className="h-[96px] rounded-md bg-surface p-lg">
          <Text className="text-muted">이 순간을 기록해보세요...</Text>
        </View>
        <View className="gap-md">
          <Text className="font-bold">시간대</Text>
          <View className="flex-row gap-sm">
            {['오전', '오후'].map((label, index) => (
              <View
                key={label}
                className={`rounded-full border px-lg py-sm ${index === 0 ? 'border-brand bg-brand' : 'border-border bg-page'}`}
              >
                <Text className={index === 0 ? 'text-on-brand' : 'text-secondary'}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View className="gap-md">
          <Text className="font-bold">공개 범위</Text>
          <View className="flex-row gap-sm">
            {['전체', '친구', '나만 보기'].map((label, index) => (
              <View
                key={label}
                className={`rounded-full border px-lg py-sm ${index === 0 ? 'border-brand-subtle bg-brand-subtle' : 'border-border bg-page'}`}
              >
                <Text className={index === 0 ? 'text-link' : 'text-secondary'}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View className="h-[52px] items-center justify-center rounded-md bg-brand">
          <Text className="font-bold text-on-brand">기록 올리기</Text>
        </View>
      </ScrollView>
    </View>
  );
}
