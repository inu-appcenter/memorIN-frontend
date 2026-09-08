import { useCallback, useEffect, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import {
  getExistingSubscription,
  isWebPushSupported,
  subscribeToPush,
  toFlatSubscription,
} from '@/features/push/lib/webPushSupport';
import {
  getNativeDeviceToken,
  getNativePermissionStatus,
  isNativePushSupported,
  nativeDeviceType,
} from '@/features/push/lib/nativePush';
import { pushPreference } from '@/features/push/lib/pushPreference';
import { routeOfNotification } from '@/features/push/lib/notificationRoute';
import {
  saveFcmToken,
  saveWebPushSubscription,
} from '@/features/push/api/pushApi';

// 앱이 열려 있을 때도 배너를 띄운다. 이 핸들러가 없으면 포그라운드 알림이
// 조용히 무시돼서 "안 온다"고 착각하기 쉽다.
// SDK 53부터 shouldShowAlert가 shouldShowBanner/shouldShowList로 갈라졌다.
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// 구독·토큰은 기기 단위인데 서버 저장은 사용자 단위다. A로 알림을 켜둔 채
// 로그아웃하고 B로 들어오면 같은 구독이 A에게 묶인 채 남는다. 그래서 로그인
// 시 현재 사용자로 다시 등록한다.
//
// 로그아웃 때 서버 삭제 API를 부르지 않는 이유: 그 시점엔 토큰이 이미 지워져
// 401이 난다. 웹은 구독을 끊어두면 백엔드가 다음 발송에서 404/410을 받고
// 알아서 지운다(WebPushService).
export function PushProvider({ children }: { children: ReactNode }) {
  const authStatus = useAuthStore((state) => state.status);
  const userId = useAuthStore((state) => state.user?.id);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      if (Platform.OS === 'web') {
        if (!isWebPushSupported()) return;

        if (authStatus === 'authenticated') {
          // 아직 알림을 켠 적 없는 사용자는 건드리지 않는다.
          // 권한 요청은 설정 화면의 버튼에서만 한다.
          if (Notification.permission !== 'granted') return;
          // 브라우저 권한은 오리진 단위라 계정을 바꿔도 granted로 남는다.
          // 명시적으로 끈 사용자를 여기서 다시 켜지 않도록 확인한다.
          if (userId && (await pushPreference.isOptedOut(userId))) return;

          const subscription = await subscribeToPush();
          if (cancelled || !subscription) return;

          const flat = toFlatSubscription(subscription);
          // 재등록 실패는 조용히 넘긴다. 여기서 토스트를 띄우면 앱을 열 때마다 뜬다.
          if (flat) await saveWebPushSubscription(flat).catch(() => {});
          return;
        }

        if (authStatus === 'unauthenticated') {
          const existing = await getExistingSubscription();
          if (!cancelled) await existing?.unsubscribe();
        }
        return;
      }

      // 네이티브 — 토큰은 갱신될 수 있어 로그인마다 다시 올린다.
      if (!isNativePushSupported() || authStatus !== 'authenticated') return;
      if ((await getNativePermissionStatus()) !== 'granted') return;

      const token = await getNativeDeviceToken();
      if (cancelled || !token) return;
      await saveFcmToken(token, nativeDeviceType()).catch(() => {});
    };

    sync();

    return () => {
      cancelled = true;
    };
  }, [authStatus, userId]);

  // 푸시가 도착하면 관련 캐시를 버린다. 이게 없으면 알림을 탭해 들어가도
  // staleTime(팔로우 요청은 30초) 안에는 옛 데이터가 그대로 보인다. 실제로
  // 요청이 와 있는데 SocialPage의 "받은 요청" 섹션이 requests.length === 0이라
  // 아예 그려지지 않는 증상으로 나타난다.
  //
  // router.navigate는 이미 스택에 있는 화면을 재사용하므로 refetchOnMount도
  // 걸리지 않는다. 그래서 여기서 명시적으로 무효화한다.
  const invalidateFor = useCallback(
    (type?: string) => {
      switch (type) {
        case 'FOLLOW_REQUEST':
        case 'FOLLOW_ACCEPTED':
          // 받은 요청·친구 목록·프로필이 모두 ['users'] 아래에 있다.
          queryClient.invalidateQueries({ queryKey: ['users'] });
          break;
        case 'COMMENT':
          queryClient.invalidateQueries({ queryKey: ['comments'] });
          break;
        // LIKE는 피드 전체를 다시 받아야 해서 비용 대비 얻는 게 적다.
        // 알림 화면이 붙으면 그쪽 쿼리만 무효화하도록 바꾼다.
        default:
          break;
      }
    },
    [queryClient]
  );

  // 앱이 열려 있는 동안 도착한 알림도 화면에 즉시 반영한다.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data as { type?: string };
        invalidateFor(data?.type);
      }
    );

    return () => subscription.remove();
  }, [invalidateFor]);

  // 알림을 탭했을 때의 이동. 웹은 서비스워커의 notificationclick이 담당한다.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const handle = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as {
        type?: string;
      };
      invalidateFor(data?.type);
      router.navigate(routeOfNotification(data?.type));
    };

    // 앱이 완전히 종료된 상태에서 알림을 탭해 실행된 경우, 리스너가 붙기 전에
    // 이벤트가 지나가 버려서 아래 리스너로는 못 잡는다.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handle(response);
    });

    const subscription =
      Notifications.addNotificationResponseReceivedListener(handle);

    return () => subscription.remove();
  }, [invalidateFor, router]);

  return <>{children}</>;
}
