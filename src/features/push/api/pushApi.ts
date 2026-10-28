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
// 로그아웃 때는 이걸 부르지 않는다. 로그아웃 요청 본문에 endpoint를 담으면
// 서버가 함께 지운다(getCurrentPushTarget).
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

// DELETE /api/fcm/token — 현재 사용자에게 묶인 이 기기의 토큰만 지운다.
// 로그아웃 때는 부르지 않는다. 로그아웃 요청 본문에 토큰을 담는다.
export async function deleteFcmToken(token: string): Promise<void> {
  const { data } = await client.delete<ApiResponse<null>>('/api/fcm/token', {
    data: { token },
  });

  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.pushUnregister')
    );
  }
}
