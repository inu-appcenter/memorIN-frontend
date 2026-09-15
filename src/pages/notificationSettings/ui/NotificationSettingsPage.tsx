import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { Toggle } from '@/shared/ui/toggle';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { COLORS } from '@/shared/lib/theme';
import { useBreakpoints } from '@/shared/lib/useBreakpoints';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import {
  notificationPreference,
  usePushSubscription,
  DEFAULT_NOTIFICATION_PREFERENCE,
  NOTIFICATION_KINDS,
  type NotificationKind,
  type NotificationPreference,
} from '@/features/push';
import BackArrowIcon from '@/shared/assets/icons/back-arrow.svg';

const KIND_LABEL_KEY = {
  like: 'notificationSettings.like',
  comment: 'notificationSettings.comment',
  followRequest: 'notificationSettings.followRequest',
  message: 'notificationSettings.message',
  followerRecord: 'notificationSettings.followerRecord',
} as const satisfies Record<NotificationKind, string>;

const PUSH_STATE_LABEL_KEY = {
  unsupported: 'settings.pushUnsupported',
  devBuildRequired: 'settings.pushDevBuildRequired',
  unconfigured: 'settings.pushUnconfigured',
  denied: 'settings.pushDenied',
  off: 'settings.pushOff',
  on: 'settings.pushOn',
} as const;

function ToggleRow({
  label,
  caption,
  value,
  onChange,
  disabled,
}: {
  label: string;
  caption?: string;
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View className="min-h-[56px] flex-row items-center justify-between gap-lg px-xl py-lg">
      <View className="flex-1 gap-xs">
        <Text className={disabled ? 'text-muted' : 'text-primary'}>
          {label}
        </Text>
        {caption && (
          <Text variant="caption" className="text-muted">
            {caption}
          </Text>
        )}
      </View>
      <Toggle value={value} onChange={onChange} disabled={disabled} />
    </View>
  );
}

export function NotificationSettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { device } = useBreakpoints();
  const userId = useAuthStore((s) => s.user?.id);
  const push = usePushSubscription();

  const [preference, setPreference] = useState<NotificationPreference>(
    DEFAULT_NOTIFICATION_PREFERENCE
  );

  useEffect(() => {
    if (!userId) return;
    notificationPreference.get(userId).then(setPreference);
  }, [userId]);

  const pushOn = push.state === 'on';
  const masterDisabled =
    push.isBusy ||
    push.state === 'unsupported' ||
    push.state === 'devBuildRequired' ||
    push.state === 'unconfigured' ||
    (push.state === 'denied' && Platform.OS === 'web');

  const handleToggleKind = async (kind: NotificationKind, next: boolean) => {
    if (!userId) return;
    const updated = { ...preference, [kind]: next };
    setPreference(updated);
    await notificationPreference.set(userId, updated);
  };

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
        <Text variant="heading">{t('notificationSettings.title')}</Text>
      </View>

      <View
        className="flex-1"
        style={device === 'desktop' ? { alignItems: 'center' } : undefined}
      >
        <ScrollView
          className="w-full flex-1"
          style={device === 'desktop' ? { maxWidth: 720 } : undefined}
        >
          {/* 이 행만 실제 구독을 등록·해제한다 */}
          <ToggleRow
            label={t('notificationSettings.allPush')}
            caption={
              masterDisabled ? t(PUSH_STATE_LABEL_KEY[push.state]) : undefined
            }
            value={pushOn}
            disabled={masterDisabled}
            onChange={(next) => (next ? push.enable() : push.disable())}
          />

          {NOTIFICATION_KINDS.map((kind) => (
            <ToggleRow
              key={kind}
              label={t(KIND_LABEL_KEY[kind])}
              value={preference[kind]}
              disabled={!pushOn}
              onChange={(next) => handleToggleKind(kind, next)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
