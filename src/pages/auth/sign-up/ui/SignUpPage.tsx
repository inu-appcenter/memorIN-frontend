import { Link } from 'expo-router';
import { View, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text } from '@/shared/ui/text';
import { Field } from '../../ui/Field';
import { useSignUp } from '@/features/auth/model/useSignUp';
import {
  signUpSchema,
  type SignUpInput,
} from '@/features/auth/model/authSchema';
import { useTranslation } from 'react-i18next';

export function SignUpPage() {
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

  const { mutate, isPending, error: submitError } = useSignUp();

  const onSubmit = (data: SignUpInput) => mutate(data);
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-page px-lg">
      <View className="w-full max-w-[420px]">
        <View className="mb-3xl">
          <Text className="font-sans-bold text-[40px] text-primary">
            MemorIN
          </Text>
          <Text className="mt-sm text-muted">{t('signUp.taglineFirst')}</Text>
          <Text className="text-muted">{t('signUp.tagline')}</Text>
        </View>

        <View className="gap-md">
          {/* 이메일 입력 폼 */}
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <Field
                placeholder={t('signUp.emailPlaceholder')}
                value={value}
                onChangeText={onChange}
                returnKeyType="next"
                onSubmitEditing={handleSubmit(onSubmit)}
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
                placeholder={t('signUp.passwordPlaceholder')}
                value={value}
                onChangeText={onChange}
                isPassword
                returnKeyType="next"
                onSubmitEditing={handleSubmit(onSubmit)}
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
                placeholder={t('signUp.passwordConfirmPlaceholder')}
                value={value}
                onChangeText={onChange}
                isPassword
                returnKeyType="next"
                onSubmitEditing={handleSubmit(onSubmit)}
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
                placeholder={t('signUp.usernamePlaceholder')}
                value={value}
                onChangeText={onChange}
                returnKeyType="next"
                onSubmitEditing={handleSubmit(onSubmit)}
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
                placeholder={t('signUp.displayNamePlaceholder')}
                value={value}
                onChangeText={onChange}
                returnKeyType="next"
                onSubmitEditing={handleSubmit(onSubmit)}
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
            {isPending ? t('signUp.submitting') : t('signUp.submit')}
          </Text>
        </Pressable>

        <View className="mt-md flex-row justify-center gap-sm">
          <Text className="text-muted">{t('signUp.hasAccount')}</Text>
          <Link href="/sign-in">
            <Text className="font-sans-bold text-link">
              {t('signUp.signIn')}
            </Text>
          </Link>
        </View>

        <View className="mt-5xl flex-row items-center gap-md">
          <View className="h-px flex-1 bg-border" />
          <Text className="text-muted">{t('signUp.snsDivider')}</Text>
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
