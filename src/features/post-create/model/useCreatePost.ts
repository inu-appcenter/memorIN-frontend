import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadMedia,
  type PickedMediaAsset,
  type UploadedAttachment,
} from '@/features/media-upload';
import {
  createPost,
  type CreatePostAttachment,
  type TagType,
  type TimeslotType,
  type VisibilityType,
} from '@/entities/post';
import { ApiError } from '@/shared/api/client';

export interface CreatePostInput {
  content: string;
  visibilityType: VisibilityType;
  timeslotType: TimeslotType;
  recordedDate?: string;
  assets: PickedMediaAsset[];
  tags?: TagType[];
  // 화면을 떠나면 업로드와 게시물 생성을 멈춘다. 없으면 나간 뒤에도 게시물이 생긴다.
  signal?: AbortSignal;
}

// 업로드가 끝난 첨부를 다시 쓰는 시간. 백엔드는 presigned URL을 발급할 때 용량을 예약하고
// (STORAGE_QUOTA_PENDING_TTL_SECONDS 기본 900초) 게시물에 붙일 때 예약이 살아 있어야
// 받는다. 발급 직전부터 재고 5분 여유를 둔다.
const REUSE_UPLOAD_WINDOW_MS = 10 * 60 * 1000;

// 예약이 없거나 만료된 첨부. 다시 올려야 한다.
const UPLOAD_RESERVATION_INVALID = 'MEDIA_007';

interface UploadedEntry {
  attachment: UploadedAttachment;
  reservedAt: number;
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  // 게시가 실패하면 이미 올라간 첨부를 기억해 재시도 때 다시 올리지 않는다. 다시 올리면
  // 저장소에 같은 파일이 쌓이고, 앞선 예약이 만료될 때까지 용량을 이중으로 차지해 할당량에
  // 막힐 수 있다. 키는 선택한 파일의 uri다. 파일을 바꾸면 uri가 달라 새로 올린다.
  const uploadedRef = useRef(new Map<string, UploadedEntry>());

  const uploadAll = async (
    input: CreatePostInput,
    reuse: boolean
  ): Promise<{ attachments: CreatePostAttachment[]; reused: boolean }> => {
    const uploaded = uploadedRef.current;
    const attachments: CreatePostAttachment[] = [];
    let reused = false;
    for (const asset of input.assets) {
      const cached = uploaded.get(asset.uri);
      if (
        reuse &&
        cached &&
        Date.now() - cached.reservedAt < REUSE_UPLOAD_WINDOW_MS
      ) {
        attachments.push(cached.attachment);
        reused = true;
        continue;
      }
      const reservedAt = Date.now();
      const fileName = asset.fileName ?? `${asset.type}-${reservedAt}`;
      const attachment = await uploadMedia(
        {
          uri: asset.uri,
          type: asset.type,
          mimeType: asset.mimeType,
          durationMs: asset.durationMs,
          width: asset.width,
          height: asset.height,
        },
        fileName,
        input.signal
      );
      uploaded.set(asset.uri, { attachment, reservedAt });
      attachments.push(attachment);
    }
    return { attachments, reused };
  };

  const submit = (
    input: CreatePostInput,
    attachments: CreatePostAttachment[]
  ) =>
    // 이미 취소된 signal을 받으면 axios가 요청을 보내지 않고 바로 실패한다.
    createPost(
      {
        content: input.content,
        visibilityType: input.visibilityType,
        timeslotType: input.timeslotType,
        recordedDate: input.recordedDate,
        attachments,
        tags: input.tags,
      },
      input.signal
    );

  return useMutation({
    mutationFn: async (input: CreatePostInput) => {
      const { attachments, reused } = await uploadAll(input, true);
      try {
        return await submit(input, attachments);
      } catch (error) {
        const reservationInvalid =
          error instanceof ApiError &&
          error.code === UPLOAD_RESERVATION_INVALID;
        if (!reservationInvalid) throw error;
        // 기억해 둔 첨부가 서버에서 무효가 됐다. 지우고, 다시 쓴 첨부가 있었으면 한 번 새로
        // 올려 본다. 새로 올린 첨부가 거절된 경우는 다시 올려도 같으므로 그대로 실패한다.
        uploadedRef.current.clear();
        if (!reused) throw error;
        const fresh = await uploadAll(input, false);
        return submit(input, fresh.attachments);
      }
    },
    onSuccess: () => {
      uploadedRef.current.clear();
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}
