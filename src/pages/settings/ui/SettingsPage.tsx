import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { useMyProfile } from '@/entities/session/model/useMyProfile';
import ArrowLeftIcon from '@/shared/assets/icons/arrow-left.svg';

function SectionTitle({ label }: { label: string }) {
  return (
    <View className="bg-surface px-xl py-md">
      <Text variant="body-strong" className="text-muted">
        {label}
      </Text>
    </View>
  );
}

function SettingRow({
  label,
  value,
  onPress,
  disabled,
}: {
  label: string;
  value?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const content = (
    <View className="min-h-[56px] flex-row items-center justify-between gap-lg px-xl py-lg">
      <Text className={disabled ? 'text-muted' : 'text-primary'}>{label}</Text>
      <View className="max-w-[60%] flex-row items-center gap-sm">
        {typeof value === 'string' ? (
          <Text className="text-muted" numberOfLines={1}>
            {value}
          </Text>
        ) : (
          value
        )}
        {onPress && !disabled && <Text className="text-tertiary">›</Text>}
      </View>
    </View>
  );

  if (!onPress || disabled) return content;

  return (
    <Pressable onPress={onPress} className="active:bg-subtle">
      {content}
    </Pressable>
  );
}

export function SettingsPage() {
  const router = useRouter();
  const { device } = useBreakpoints();
  const email = useAuthStore((s) => s.user?.email);
  const { data: profile, isLoading } = useMyProfile();

  const appVersion = Constants.expoConfig?.version ?? '-';

  return (
    <View className="flex-1 bg-page">
      <View className="flex-row items-center gap-md px-xl py-lg">
        <Pressable
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/feed')
          }
          hitSlop={8}
        >
          <ArrowLeftIcon width={20} height={20} color={COLORS.text} />
        </Pressable>
        <Text variant="heading">설정</Text>
      </View>

      <View
        className="flex-1"
        style={device === 'desktop' ? { alignItems: 'center' } : undefined}
      >
        <ScrollView
          className="w-full flex-1"
          style={device === 'desktop' ? { maxWidth: 720 } : undefined}
        >
          <SectionTitle label="계정" />
          {isLoading ? (
            <View className="items-center py-2xl">
              <ActivityIndicator color={COLORS.brand} />
            </View>
          ) : (
            <>
              <SettingRow label="이름" value={profile?.displayName ?? '-'} />
              <SettingRow
                label="아이디"
                value={profile?.username ? `@${profile.username}` : '-'}
              />
              <SettingRow label="이메일" value={email ?? '-'} />
            </>
          )}

          <SectionTitle label="일반" />
          {/* 다국어 지원 작업에서 이 자리에 언어 선택을 붙인다 */}
          <SettingRow label="언어" value="준비 중" disabled />
          <SettingRow label="알림" value="준비 중" disabled />

          <SectionTitle label="앱 정보" />
          <SettingRow label="버전" value={appVersion} />
        </ScrollView>
      </View>
    </View>
  );
}
