import { Link, useRouter } from 'expo-router';
import { Pressable, TextInput, View } from 'react-native';
import { useAuthStore } from '@/features/auth';
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

export function SignInPage() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);

  const handleSignIn = () => {
    signIn();
    router.replace('/feed');
  };

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
          <Field placeholder="비밀번호를 입력하세요" secureTextEntry />
        </View>
        <Pressable
          onPress={handleSignIn}
          className="mt-lg h-[52px] items-center justify-center rounded-md bg-brand active:bg-brand-press"
        >
          <Text className="font-sans-bold text-on-brand">로그인</Text>
        </Pressable>

        <View className="mt-md flex-row justify-center gap-sm">
          <Pressable>
            <Text className="text-muted">아이디 찾기</Text>
          </Pressable>
          <Text className="text-muted">·</Text>
          <Pressable>
            <Text className="text-muted">비밀번호 찾기</Text>
          </Pressable>
          <Text className="text-muted">·</Text>
          <Link href="/sign-up">
            <Text className="text-muted">회원가입</Text>
          </Link>
        </View>
        <View className="mt-5xl flex-row items-center gap-md">
          <View className="h-px flex-1 bg-border" />
          <Text className="text-muted">또는 SNS로 로그인</Text>
          <View className="h-px flex-1 bg-border" />
        </View>
        {/*sns 아이콘이 들어갈 자리 */}
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
