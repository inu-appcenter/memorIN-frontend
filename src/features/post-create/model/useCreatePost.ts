import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadMedia, type PickedMediaAsset } from '@/features/media-upload';
import {
  createPost,
  type CreatePostAttachment,
  type TimeslotType,
  type VisibilityType,
} from '@/entities/post';

export interface CreatePostInput {
  content: string;
  visibilityType: VisibilityType;
  timeslotType: TimeslotType;
  recordedDate?: string;
  assets: PickedMediaAsset[];
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
          },
          fileName
        );
        attachments.push(uploaded);
      }
      return createPost({
        content: input.content,
        visibilityType: input.visibilityType,
        timeslotType: input.timeslotType,
        recordedDate: input.recordedDate,
        attachments,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
