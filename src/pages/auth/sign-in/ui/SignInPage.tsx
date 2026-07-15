import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pressable, TextInput, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { login } from '@/shared/api/authApi';
import { useSetAuthenticated } from '@/shared/model/useAuthStore';
import { tokenStorage } from '@/shared/lib/tokenStorage';
import { signInSchema, type SignInInput } from '@/shared/model/authSchema';

export function SignInPage() {
  const router = useRouter();
  const setAuthenticated = useSetAuthenticated();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      await tokenStorage.set('refreshToken', data.refreshToken);
      setAuthenticated(data.accessToken, data.user);
      router.replace('/feed');
    },
  });

  const onSubmit = (input: SignInInput) => mutate(input);

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
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <View>
                <TextInput
                  className="h-[50px] rounded-md bg-surface px-lg text-primary"
                  placeholder="아이디를 입력하세요"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {errors.email && (
                  <Text variant="caption" className="mt-xs text-error">
                    {errors.email.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <View>
                <TextInput
                  className="h-[50px] rounded-md bg-surface px-lg text-primary"
                  placeholder="비밀번호를 입력하세요"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                />
                {errors.password && (
                  <Text variant="caption" className="mt-xs text-error">
                    {errors.password.message}
                  </Text>
                )}
              </View>
            )}
          />
        </View>

        {error && (
          <Text variant="caption" className="mt-sm text-error">
            {(error as Error).message}
          </Text>
        )}

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          className="mt-lg h-[52px] items-center justify-center rounded-md bg-brand active:bg-brand-press disabled:opacity-50"
        >
          <Text className="font-sans-bold text-on-brand">
            {isPending ? '로그인 중...' : '로그인'}
          </Text>
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

        {/* sns 아이콘이 들어갈 자리 */}
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
