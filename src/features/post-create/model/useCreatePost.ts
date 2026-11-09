import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadMedia, type PickedMediaAsset } from '@/features/media-upload';
import {
  createPost,
  type CreatePostAttachment,
  type TagType,
  type TimeslotType,
  type VisibilityType,
} from '@/entities/post';

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

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePostInput) => {
      const attachments: CreatePostAttachment[] = [];
      for (const asset of input.assets) {
        const fileName = asset.fileName ?? `${asset.type}-${Date.now()}`;
        const uploaded = await uploadMedia(
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
        attachments.push(uploaded);
      }
      // 이미 취소된 signal을 받으면 axios가 요청을 보내지 않고 바로 실패한다.
      return createPost(
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
}
