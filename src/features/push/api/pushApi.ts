import { client, ApiError, type ApiResponse } from '@/shared/api/client';
import i18next from '@/shared/lib/i18n';
import type { FlatSubscription } from '../lib/webPushSupport';
import type { NativeDeviceType } from '../lib/nativePush';

// POST /api/web-push/subscriptions
export async function saveWebPushSubscription(
  subscription: FlatSubscription
): Promise<void> {
  const { data } = await client.post<ApiResponse<null>>(
    '/api/web-push/subscriptions',
    subscription
  );

  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.pushRegister')
    );
  }
}

// DELETE에 본문을 실어야 해서 axios config의 data로 넘긴다.
//
// 로그아웃 때는 이걸 부르지 않는다 — 그 시점엔 토큰이 이미 지워져 401이 난다.
// 대신 브라우저 구독만 해제하면, 백엔드가 다음 발송에서 404/410을 받고 행을 삭제함.
export async function deleteWebPushSubscription(
  endpoint: string
): Promise<void> {
  const { data } = await client.delete<ApiResponse<null>>(
    '/api/web-push/subscriptions',
    { data: { endpoint } }
  );

  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.pushUnregister')
    );
  }
}

// POST /api/fcm/token
// 대응하는 삭제 API가 아직 없다. 앱에서 알림을 꺼도 서버 토큰은 남음.
// 실제로 발송이 멈추는 건 OS 권한을 끄고 FCM이 UNREGISTERED를 돌려준 뒤.
export async function saveFcmToken(
  token: string,
  deviceType: NativeDeviceType
): Promise<void> {
  const { data } = await client.post<ApiResponse<null>>('/api/fcm/token', {
    token,
    deviceType,
  });

  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.pushRegister')
    );
  }
}
