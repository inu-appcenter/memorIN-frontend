import { client } from '../../../shared/api/client';

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
    body
  );
  return res.data;
}
