import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { showNotReady } from '@/shared/lib/showNotReady';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import { useMyProfile } from '@/entities/session/model/useMyProfile';
import BackArrowIcon from '@/shared/assets/icons/back-arrow.svg';
import ProfileAvatarIcon from '@/shared/assets/icons/profile-avatar.svg';

const AVATAR_SIZE = 88;
const MASKED_PASSWORD = '••••••••';

// 라벨과 값이 한 박스 안에 위아래로 놓이는 시안 형태.
// 수정 API가 없어 누르면 안내만 띄운다.
function FieldRow({
  label,
  value,
  action,
  onPress,
}: {
  label: string;
  value: string;
  action?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="gap-xs rounded-md bg-surface px-lg py-md active:opacity-80"
    >
      <View className="flex-row items-center justify-between">
        <Text variant="caption" className="text-muted">
          {label}
        </Text>
        {action}
      </View>
      <Text className="text-primary">{value}</Text>
    </Pressable>
  );
}

export function AccountSettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { device } = useBreakpoints();
  const { data: profile } = useMyProfile();
  const email = useAuthStore((s) => s.user?.email);

  const empty = t('settings.emptyValue');

  return (
    <View className="flex-1 bg-page">
      <View className="flex-row items-center gap-md px-xl py-lg">
        <Pressable
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/settings')
          }
          hitSlop={8}
        >
          <BackArrowIcon width={20} height={20} color={COLORS.text} />
        </Pressable>
        <Text variant="heading">{t('account.title')}</Text>
      </View>

      <View
        className="flex-1"
        style={device === 'desktop' ? { alignItems: 'center' } : undefined}
      >
        <ScrollView
          className="w-full flex-1"
          contentContainerClassName="gap-md px-xl pb-2xl"
          style={device === 'desktop' ? { maxWidth: 720 } : undefined}
        >
          <View className="items-center gap-sm py-xl">
            <View
              className="items-center justify-center overflow-hidden rounded-full bg-subtle"
              style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            >
              {/* 프로필 이미지 업로드 경로가 없어 항상 기본 아바타가 보인다 */}
              <ProfileAvatarIcon width={AVATAR_SIZE} height={AVATAR_SIZE} />
            </View>
            <Pressable onPress={showNotReady} hitSlop={8}>
              <Text variant="body-small" className="text-link">
                {t('account.changePhoto')}
              </Text>
            </Pressable>
          </View>

          {/* 백엔드 User 엔티티에 별명·학과·학번 필드가 없어 값이 비어 있다 */}
          <FieldRow
            label={t('account.nickname')}
            value={empty}
            onPress={showNotReady}
          />
          <FieldRow
            label={t('account.displayName')}
            value={profile?.displayName || empty}
            onPress={showNotReady}
          />
          <FieldRow
            label={t('account.department')}
            value={empty}
            onPress={showNotReady}
          />
          <FieldRow
            label={t('account.studentId')}
            value={empty}
            onPress={showNotReady}
          />
          <FieldRow
            label={t('account.username')}
            value={profile?.username || empty}
            onPress={showNotReady}
          />
          <FieldRow
            label={t('account.email')}
            value={email || empty}
            onPress={showNotReady}
          />
          <FieldRow
            label={t('account.password')}
            value={MASKED_PASSWORD}
            action={
              <Pressable
                onPress={() => router.push('/password-change')}
                hitSlop={8}
              >
                <Text variant="body-small" className="text-link">
                  {t('account.changePassword')}
                </Text>
              </Pressable>
            }
          />
        </ScrollView>
      </View>
    </View>
  );
}
