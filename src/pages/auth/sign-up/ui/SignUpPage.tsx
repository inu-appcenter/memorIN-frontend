import { Link, useRouter } from 'expo-router';
import { View, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Text } from '@/shared/ui/text';
import { Field } from '../../ui/Field';
import { signup } from '@/features/auth/api/authApi';
import {
  signUpSchema,
  type SignUpInput,
} from '@/features/auth/model/authSchema';

export function SignUpPage() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
      username: '',
      displayName: '',
    },
  });

  const {
    mutate,
    isPending,
    error: submitError,
  } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      // 1. 가입 즉시 자동 로그인
      // router.replace('/feed');
      // 2. 가입 즉시 로그인 페이지로 리다이렉팅
      router.replace('/sign-in');
    },
  });

  const onSubmit = (data: SignUpInput) => mutate(data);

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
          {/* 이메일 입력 폼 */}
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <Field
                placeholder="이메일을 입력하세요"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                error={errors.email?.message}
              />
            )}
          />
          {/* 비밀번호 입력 폼 */}
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <Field
                placeholder="비밀번호를 입력하세요"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />
          {/* 비밀번호 입력 확인 폼 */}
          <Controller
            control={control}
            name="passwordConfirm"
            render={({ field: { value, onChange } }) => (
              <Field
                placeholder="비밀번호를 다시 입력하세요"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={errors.passwordConfirm?.message}
              />
            )}
          />

          {/* 사용자명 입력 폼 */}
          <Controller
            control={control}
            name="username"
            render={({ field: { value, onChange } }) => (
              <Field
                placeholder="사용자명을 입력하세요"
                value={value}
                onChangeText={onChange}
                error={errors.username?.message}
              />
            )}
          />
          {/* 표시이름 입력 폼 */}
          <Controller
            control={control}
            name="displayName"
            render={({ field: { value, onChange } }) => (
              <Field
                placeholder="표시 이름을 입력하세요"
                value={value}
                onChangeText={onChange}
                error={errors.displayName?.message}
              />
            )}
          />
        </View>

        {submitError && (
          <Text variant="caption" className="mt-md text-error">
            {(submitError as Error).message}
          </Text>
        )}

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          className="mt-lg h-[52px] items-center justify-center rounded-md bg-brand active:bg-brand-press disabled:opacity-50"
        >
          <Text className="font-sans-bold text-on-brand">
            {isPending ? '가입 중...' : '회원가입'}
          </Text>
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
