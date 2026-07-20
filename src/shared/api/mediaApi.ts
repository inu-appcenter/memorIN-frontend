import { client } from './client';

// TODO: JWT 붙으면 제거하고 실제 로그인 사용자 id로 교체
const TEST_USER_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // crypto.randomUUID() 결과값 하나 고정 (임시)

export interface PresignedUpload {
  uploadUrl: string;
  objectKey: string;
  method: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
  maxUploadSizeBytes: number;
}

// 요청 body 예시
// {
//   "fileName": "daily-photo.jpg",
//   "contentType": "image/jpeg",
//   "contentLength": 1048576
// }
// 응답 body 예시
// {
//   "uploadUrl": "http://localhost:9000/memorin-media/uploads/...",
//   "objectKey": "uploads/2026/07/01/{uuid}/daily-photo.jpg",
//   "method": "PUT",
//   "requiredHeaders": {
//     "Content-Type": "image/jpeg"
//   },
//   "expiresAt": "2026-07-01T12:10:00Z",
//   "maxUploadSizeBytes": 52428800
// }

// presignedUrl 요청 비동기함수
// 이 엔드포인트는 ApiResponse 봉투를 안 씀 — 결과를 직접 반환
export async function getPresignedUploadUrl(body: {
  fileName: string;
  contentType: string;
  contentLength: number;
}): Promise<PresignedUpload> {
  const res = await client.post<PresignedUpload>(
    '/api/media/presigned-upload-url',
    { ...body, userId: TEST_USER_ID }
  );
  return res.data;
}
