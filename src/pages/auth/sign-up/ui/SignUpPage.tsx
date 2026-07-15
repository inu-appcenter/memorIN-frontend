import { Link } from 'expo-router';
import { Pressable, TextInput, View } from 'react-native';
import { Text } from '@/shared/ui/Text';

function Field({
  placeholder,
  secureTextEntry = false,
}: {
  placeholder: string;
  secureTextEntry?: boolean;
}) {
  return (
    <TextInput
      className="h-[50px] rounded-md bg-surface px-lg text-primary outline-none"
      placeholder={placeholder}
      placeholderTextColor="#8A8F9C"
      secureTextEntry={secureTextEntry}
    />
  );
}

export function SignUpPage() {
  return (
    <View className="flex-1 items-center justify-center bg-page px-lg">
      <View className="w-full max-w-[420px]">
        <View className="mb-3xl">
          <Text className="font-sans-bold text-[40px] text-primary">
            MemorIN
          </Text>
          <Text className="mt-sm text-muted">
            오늘 하루의 기록을 캘린더에 담아
          </Text>
          <Text className="text-muted">소중한 순간을 오래 기억해요</Text>
        </View>
        <View className="gap-md">
          <Field placeholder="아이디를 입력하세요" />
          <Field placeholder="닉네임을 입력하세요" />
          <Field placeholder="비밀번호를 입력하세요" secureTextEntry />
          <Field placeholder="비밀번호를 다시 입력하세요" secureTextEntry />
        </View>
        <Pressable className="mt-lg h-[52px] items-center justify-center rounded-md bg-brand active:bg-brand-press">
          <Text className="font-sans-bold text-on-brand">회원가입</Text>
        </Pressable>
        <View className="mt-md flex-row justify-center gap-sm">
          <Text className="text-muted">이미 계정이 있나요?</Text>
          <Link href="/sign-in">
            <Text className="font-sans-bold text-link">로그인</Text>
          </Link>
        </View>
        <View className="mt-5xl flex-row items-center gap-md">
          <View className="h-px flex-1 bg-border" />
          <Text className="text-muted">또는 SNS로 가입</Text>
          <View className="h-px flex-1 bg-border" />
        </View>
        <View className="mt-xl flex-row justify-center gap-lg">
          {[0, 1, 2].map((item) => (
            <View
              key={item}
              className="h-[46px] w-[46px] rounded-full bg-subtle"
            />
          ))}
        </View>
      </View>
    </View>
  );
}
