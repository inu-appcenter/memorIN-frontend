import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleCommentEmojis, type EmojiSummary } from '../api/reactionApi';
import { EMOJI_TYPE_TO_REACTION, REACTION_TO_EMOJI_TYPE } from './emojiTypeMap';
import type { ReactionType } from './types';
import { toast } from '@/shared/lib/toast';

// entities/post의 PostComment 전체를 끌어오면 entities/reaction ↔ entities/post
// 순환 참조가 생긴다. 캐시 업데이트에 필요한 필드만 구조적으로 선언해서 쓴다.
interface CommentWithEmojis {
  commentId: string;
  emojis: EmojiSummary[];
}

// 댓글 이모지는 댓글 스레드 응답(PostCommentResponse.emojis)에 이미 집계돼 내려오므로
// 별도 조회 없이 그 배열을 변환해서 쓴다. 서버는 한 유저가 같은 댓글에 여러 이모지
// 타입을 동시에 남기는 걸 허용한다(타입별로 독립 토글) — myReaction을 단일 값이 아니라
// Set으로 다룬다.
export function useCommentReactionState(
  postId: string,
  commentId: string,
  emojis: EmojiSummary[]
) {
  const queryClient = useQueryClient();
  const queryKey = ['comments', postId];

  const counts: Partial<Record<ReactionType, number>> = {};
  const myReactions = new Set<ReactionType>();
  for (const summary of emojis) {
    const type = EMOJI_TYPE_TO_REACTION[summary.emojiType];
    if (summary.count > 0) counts[type] = summary.count;
    if (summary.reactedByMe) myReactions.add(type);
  }

  const toggleMutation = useMutation({
    mutationFn: (type: ReactionType) =>
      toggleCommentEmojis(commentId, REACTION_TO_EMOJI_TYPE[type]),
    onMutate: async (type: ReactionType) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CommentWithEmojis[]>(queryKey);
      const emojiType = REACTION_TO_EMOJI_TYPE[type];

      queryClient.setQueryData<CommentWithEmojis[]>(queryKey, (old) =>
        old?.map((c) => {
          if (c.commentId !== commentId) return c;

          const existing = c.emojis.find((e) => e.emojiType === emojiType);
          const others = c.emojis.filter((e) => e.emojiType !== emojiType);

          if (existing?.reactedByMe) {
            const nextCount = existing.count - 1;
            return {
              ...c,
              emojis:
                nextCount > 0
                  ? [
                      ...others,
                      { ...existing, count: nextCount, reactedByMe: false },
                    ]
                  : others,
            };
          }

          return {
            ...c,
            emojis: [
              ...others,
              {
                emojiType,
                count: (existing?.count ?? 0) + 1,
                reactedByMe: true,
              },
            ],
          };
        })
      );

      return { previous };
    },
    onError: (error, _type, context) => {
      // 낙관적 업데이트를 되돌리고, 실패했다는 사실을 사용자에게 알린다.
      // (안 알리면 오프라인에서 토글이 성공한 것처럼 보였다가 조용히 되돌아간다)
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error((error as Error).message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    counts,
    myReactions,
    toggle: (type: ReactionType) => toggleMutation.mutate(type),
  };
}
