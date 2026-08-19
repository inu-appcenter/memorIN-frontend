import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { Field } from '@/pages/auth/ui/Field';
import { useSignIn } from '@/features/auth/model/useSignIn';
import {
  signInSchema,
  type SignInInput,
} from '@/features/auth/model/authSchema';
import MemorINLogo from '@/shared/assets/icons/memorIN_logo.svg';
import { useTranslation } from 'react-i18next';

export function SignInPage() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const { mutate, isPending, error } = useSignIn();

  const onSubmit = (input: SignInInput) => mutate(input);
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center bg-page px-lg">
      <View className="w-full max-w-[420px]">
        <View className="mx-auto mb-3xl flex-row gap-xl">
          <MemorINLogo />
          <Text className="font-sans-bold text-[40px] text-brand">MemorIN</Text>
        </View>

        <View className="gap-md">
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <Field
                placeholder={t('signIn.emailPlaceholder')}
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={handleSubmit(onSubmit)}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <Field
                placeholder={t('signIn.passwordPlaceholder')}
                value={value}
                onChangeText={onChange}
                isPassword
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
                error={errors.password?.message}
              />
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
          className="mt-lg h-[52px] items-center justify-center rounded-lg bg-brand active:bg-brand-press disabled:opacity-50"
        >
          <Text className="font-sans-bold text-on-brand">
            {isPending ? t('signIn.submitting') : t('signIn.submit')}
          </Text>
        </Pressable>

        <View className="mt-md flex-row justify-center gap-sm">
          <Pressable>
            <Text className="text-muted">{t('signIn.findId')}</Text>
          </Pressable>
          <Text className="text-muted">·</Text>
          <Pressable>
            <Text className="text-muted">{t('signIn.findPassword')}</Text>
          </Pressable>
          <Text className="text-muted">·</Text>
          <Link href="/sign-up">
            <Text className="text-muted">{t('signIn.signUp')}</Text>
          </Link>
        </View>

        <View className="mt-5xl flex-row items-center gap-md">
          <View className="h-px flex-1 bg-border" />
          <Text className="text-muted">{t('signIn.snsDivider')}</Text>
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
