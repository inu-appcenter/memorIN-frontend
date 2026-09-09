import { client, ApiError, type ApiResponse } from '@/shared/api/client';
import i18next from '@/shared/lib/i18n';

export type NotificationType =
  'FOLLOW_REQUEST' | 'FOLLOW_ACCEPTED' | 'COMMENT' | 'LIKE';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  actorId: string | null;
  actorUsername: string | null;
  actorDisplayName: string | null;
  // 백엔드가 완성해 보내는 한국어 문구. 프론트가 아는 타입은 i18n으로 조립하고,
  // 모르는 타입이 오면 이 값을 그대로 보여준다.
  title: string;
  message: string;
  referenceId: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationPage {
  items: NotificationItem[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface GetNotificationsParams {
  cursor?: string;
  size?: number;
}

// GET /api/notifications — 인증 필요. 최신순 커서 페이징.
export async function getNotifications(
  params: GetNotificationsParams = {}
): Promise<NotificationPage> {
  const { data } = await client.get<ApiResponse<NotificationPage>>(
    '/api/notifications',
    { params: { cursor: params.cursor, size: params.size } }
  );

  if (!data.success || !data.data) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.notificationsLoad')
    );
  }

  return data.data;
}

// PATCH /api/notifications/{id}/read
export async function readNotification(notificationId: string): Promise<void> {
  const { data } = await client.patch<ApiResponse<null>>(
    `/api/notifications/${notificationId}/read`
  );

  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.notificationRead')
    );
  }
}

// PATCH /api/notifications/read-all
export async function readAllNotifications(): Promise<void> {
  const { data } = await client.patch<ApiResponse<null>>(
    '/api/notifications/read-all'
  );

  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN',
      data.error?.message ?? i18next.t('error.notificationRead')
    );
  }
}
