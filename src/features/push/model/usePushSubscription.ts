import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import i18next from '@/shared/lib/i18n';
import { toast } from '@/shared/lib/toast';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import {
  getExistingSubscription,
  isWebPushSupported,
  subscribeToPush,
  toFlatSubscription,
  VAPID_PUBLIC_KEY,
} from '../lib/webPushSupport';
import {
  getNativeDeviceToken,
  getNativePermissionStatus,
  isExpoGo,
  isNativePushSupported,
  nativeDeviceType,
  requestNativePermission,
} from '../lib/nativePush';
import { pushPreference } from '../lib/pushPreference';
import {
  deleteWebPushSubscription,
  saveFcmToken,
  saveWebPushSubscription,
} from '../api/pushApi';

export type PushState =
  | 'unsupported' // 브라우저가 Push API를 모르거나, iOS(아직 미지원)
  | 'devBuildRequired' // Expo Go — 원격 푸시가 안 된다
  | 'unconfigured' // VAPID 공개키가 빌드에 안 들어왔다 (웹)
  | 'denied' // 사용자가 차단했다 — 앱에서 되돌릴 수 없다
  | 'off'
  | 'on';

const isWeb = Platform.OS === 'web';

export function usePushSubscription() {
  const userId = useAuthStore((state) => state.user?.id);
  const [state, setState] = useState<PushState>('unsupported');
  const [isBusy, setIsBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (isWeb) {
      if (!isWebPushSupported()) {
        setState('unsupported');
        return;
      }
      if (!VAPID_PUBLIC_KEY) {
        setState('unconfigured');
        return;
      }
      if (Notification.permission === 'denied') {
        setState('denied');
        return;
      }
      // 권한이 남아 있어도 사용자가 껐다면 꺼진 상태다.
      if (userId && (await pushPreference.isOptedOut(userId))) {
        setState('off');
        return;
      }

      const existing = await getExistingSubscription();
      setState(existing ? 'on' : 'off');
      return;
    }

    if (isExpoGo()) {
      setState('devBuildRequired');
      return;
    }
    if (!isNativePushSupported()) {
      setState('unsupported');
      return;
    }

    // 네이티브는 "서버에 등록했는지"를 앱이 알 수 없다. OS 권한이 유일한 단서다.
    const permission = await getNativePermissionStatus();
    if (permission === 'denied') {
      setState('denied');
      return;
    }
    setState(permission === 'granted' ? 'on' : 'off');
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const enable = useCallback(async () => {
    setIsBusy(true);
    try {
      if (isWeb) {
        // 권한 요청은 사용자 제스처 안에서만 허용된다. 그래서 이 함수는
        // 버튼 onPress에서만 부르고, 자동 동기화 쪽에서는 부르지 않는다.
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setState(permission === 'denied' ? 'denied' : 'off');
          return;
        }

        const subscription = await subscribeToPush();
        const flat = subscription ? toFlatSubscription(subscription) : null;
        if (!flat) throw new Error(i18next.t('error.pushRegister'));

        await saveWebPushSubscription(flat);
        if (userId) await pushPreference.setOptedOut(userId, false);
      } else {
        const permission = await requestNativePermission();
        if (permission !== 'granted') {
          setState(permission === 'denied' ? 'denied' : 'off');
          return;
        }

        const token = await getNativeDeviceToken();
        if (!token) throw new Error(i18next.t('error.pushRegister'));

        await saveFcmToken(token, nativeDeviceType());
      }

      setState('on');
      toast.success(i18next.t('settings.pushEnabled'));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : i18next.t('error.pushRegister')
      );
      await refresh();
    } finally {
      setIsBusy(false);
    }
  }, [refresh, userId]);

  const disable = useCallback(async () => {
    // 네이티브는 앱이 알림 권한을 되돌릴 수 없고, 백엔드에 FCM 토큰 삭제 API도
    // 아직 없다. OS 설정으로 보내서 거기서 끄게 한다.
    if (!isWeb) {
      await Linking.openSettings();
      return;
    }

    setIsBusy(true);
    try {
      const existing = await getExistingSubscription();
      if (existing) {
        // 서버를 먼저 지운다. 브라우저 구독만 없애면 서버에 유령 행이 남아
        // 다음 발송이 한 번 실패해야 정리된다.
        await deleteWebPushSubscription(existing.endpoint);
        await existing.unsubscribe();
      }
      // 브라우저 권한은 granted로 남으므로, 이 표시가 없으면 다음 실행에서
      // PushProvider가 구독을 다시 만들어 꺼둔 게 원복된다.
      if (userId) await pushPreference.setOptedOut(userId, true);

      setState('off');
      // 기능을 끄는 동작이라 성공(녹색)이 아니라 중립(회색)으로 알린다.
      toast.neutral(i18next.t('settings.pushDisabled'));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : i18next.t('error.pushUnregister')
      );
      await refresh();
    } finally {
      setIsBusy(false);
    }
  }, [refresh, userId]);

  return { state, isBusy, enable, disable, refresh };
}
