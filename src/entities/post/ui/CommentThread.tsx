import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/shared/ui/text';
import { Sheet } from '@/shared/ui/sheet';
import { toast } from '@/shared/lib/toast';
import { getSurfaceColors } from '@/shared/lib/theme';
import i18next from '@/shared/lib/i18n';
import { ReplyBar } from '@/shared/ui/replyBar';
import { ReactionBar } from '@/entities/reaction';
import { useAuthStore } from '@/entities/session/model/useAuthStore';
import {
  useCommentThread,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from '../model/useComments';
import type { PostComment } from '../api/commentsApi';

interface CommentThreadProps {
  postId: string;
  variant?: 'dark' | 'light';
  polling?: boolean;
  onClose?: () => void;
}

// 아바타(36) + gap-md(12). 반응 배지를 본문 텍스트 시작선에 맞춘다.
const CONTENT_OFFSET_PX = 48;
const POLLING_INTERVAL_MS = 5000;
const REPLY_INDENT_PX = 44;
// 우측 상단 액션(••• , 이모지 배지)에 본문이 깔리지 않도록 확보하는 여백

// 백엔드가 LocalDateTime을 타임존 표기 없이 내려준다 ("2026-08-20T11:22:10.804015").
// JS는 오프셋 없는 날짜시간 문자열을 '로컬 시간'으로 해석하는데 실제 값은 UTC라,
// 그대로 파싱하면 KST 기준 항상 9시간 어긋난다. 오프셋이 없으면 UTC로 못박는다.
function parseServerDate(iso: string): Date {
  const hasTimezone = /(Z|[+-]\d{2}:?\d{2})$/.test(iso);
  return new Date(hasTimezone ? iso : `${iso}Z`);
}

function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - parseServerDate(iso).getTime();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMin < 1) return i18next.t('comment.timeJustNow');
  if (diffMin < 60) return i18next.t('comment.timeMinutes', { count: diffMin });
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return i18next.t('comment.timeHours', { count: diffHour });
  const diffDay = Math.floor(diffHour / 24);
  return i18next.t('comment.timeDays', { count: diffDay });
}
// 본인 댓글이면 수정/삭제, 남의 댓글이면 신고만 보여준다.
// 신고는 백엔드에 API가 없어 안내만 띄운다.
function CommentActionsSheet({
  visible,
  isMine,
  isDeleting,
  onClose,
  onEdit,
  onDelete,
}: {
  visible: boolean;
  isMine: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 8, gap: 4 }}>
        {isMine ? (
          <>
            <Pressable onPress={onEdit} style={{ paddingVertical: 12 }}>
              <Text variant="body" className="text-primary">
                {t('comment.edit')}
              </Text>
            </Pressable>
            <Pressable
              onPress={onDelete}
              disabled={isDeleting}
              style={{ paddingVertical: 12 }}
            >
              <Text variant="body" className="text-error">
                {t('comment.delete')}
              </Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={() => {
              onClose();
              toast.success(t('comment.reportNotReady'));
            }}
            style={{ paddingVertical: 12 }}
          >
            <Text variant="body" className="text-primary">
              {t('comment.report')}
            </Text>
          </Pressable>
        )}
      </View>
    </Sheet>
  );
}

interface CommentRowProps {
  comment: PostComment;
  postId: string;
  myId: string | undefined;
  isReply: boolean;
  colors: ReturnType<typeof getSurfaceColors>;
  onPressReply: (comment: PostComment) => void;
}

function CommentRow({
  comment,
  postId,
  myId,
  isReply,
  colors,
  onPressReply,
}: CommentRowProps) {
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);

  const updateComment = useUpdateComment(postId);
  const deleteComment = useDeleteComment(postId);

  // 삭제된 댓글(tombstone)은 작성자 정보가 null로 내려와 본인 판별이 불가능하고,
  // 수정·삭제·신고 어느 것의 대상도 아니다.
  const isMine = !comment.deleted && Boolean(myId) && comment.authorId === myId;

  const authorLabel = comment.deleted
    ? t('comment.deleted')
    : (comment.authorDisplayName ??
      comment.authorUsername ??
      t('comment.unknownAuthor'));

  const runDelete = () => {
    setMenuVisible(false);
    deleteComment.mutate(comment.commentId, {
      onError: (error) => toast.error((error as Error).message),
    });
  };

  const handlePressDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('comment.deleteConfirm'))) runDelete();
      return;
    }
    Alert.alert(t('comment.deleteTitle'), t('comment.deleteConfirm'), [
      { text: t('action.cancel'), style: 'cancel' },
      { text: t('comment.delete'), style: 'destructive', onPress: runDelete },
    ]);
  };

  const handleSaveEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === comment.body) {
      setEditing(false);
      return;
    }
    updateComment.mutate(
      { commentId: comment.commentId, body: trimmed },
      {
        onSuccess: () => setEditing(false),
        onError: (error) => toast.error((error as Error).message),
      }
    );
  };

  return (
    <>
      <ReactionBar
        postId={postId}
        commentId={comment.commentId}
        emojis={comment.emojis}
        summaryIndent={CONTENT_OFFSET_PX + (isReply ? REPLY_INDENT_PX : 0)}
      >
        {({ hovering, pickerButton }) => (
          <View
            className="flex-row gap-md py-md"
            style={{ paddingLeft: isReply ? REPLY_INDENT_PX : undefined }}
          >
            <View
              className="h-[36px] w-[36px] rounded-full"
              style={{ backgroundColor: colors.avatarBackground }}
            />
            <View className="flex-1">
              {/* 닉네임 · 시간 · ••• · (호버 시)이모지 배지를 한 줄에 나란히 둔다 */}
              <View className="flex-row items-center gap-sm">
                <Text variant="label" style={{ color: colors.textPrimary }}>
                  {authorLabel}
                </Text>
                <Text variant="caption" style={{ color: colors.textMuted }}>
                  {formatTimeAgo(comment.createdAt)}
                </Text>
                {!comment.deleted && !editing && (
                  <>
                    <Pressable onPress={() => setMenuVisible(true)} hitSlop={8}>
                      <Text style={{ color: colors.textMuted }}>•••</Text>
                    </Pressable>
                    {hovering && pickerButton}
                  </>
                )}
              </View>

              {editing ? (
                <View className="mt-xs gap-sm">
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    multiline
                    autoFocus
                    className="rounded-md px-md py-sm"
                    style={{
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }}
                  />
                  <View className="flex-row gap-lg">
                    <Pressable
                      onPress={handleSaveEdit}
                      disabled={updateComment.isPending}
                    >
                      <Text variant="caption" className="font-bold text-link">
                        {updateComment.isPending
                          ? t('comment.editSaving')
                          : t('comment.editSave')}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setDraft(comment.body);
                        setEditing(false);
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{ color: colors.textMuted }}
                      >
                        {t('action.cancel')}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  <Text
                    variant="body-small"
                    className="mt-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {comment.body}
                  </Text>
                  {/* 답글의 답글(2depth)은 이번 범위 밖이라 최상위 댓글에만 노출 */}
                  {!comment.deleted && !isReply && (
                    <Pressable
                      onPress={() => onPressReply(comment)}
                      hitSlop={4}
                      className="mt-xs self-start"
                    >
                      <Text
                        variant="caption"
                        style={{ color: colors.textMuted }}
                      >
                        {t('comment.reply')}
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          </View>
        )}
      </ReactionBar>

      <CommentActionsSheet
        visible={menuVisible}
        isMine={isMine}
        isDeleting={deleteComment.isPending}
        onClose={() => setMenuVisible(false)}
        onEdit={() => {
          setMenuVisible(false);
          setDraft(comment.body);
          setEditing(true);
        }}
        onDelete={handlePressDelete}
      />
    </>
  );
}

export function CommentThread({
  postId,
  variant = 'light',
  polling = false,
  onClose,
}: CommentThreadProps) {
  const { t } = useTranslation();
  const colors = getSurfaceColors(variant);
  const myId = useAuthStore((s) => s.user?.id);

  const { data: comments, isLoading } = useCommentThread(postId, {
    refetchInterval: polling ? POLLING_INTERVAL_MS : undefined,
  });
  const createComment = useCreateComment(postId);

  const [replyTarget, setReplyTarget] = useState<PostComment | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // 백엔드 getThread는 parentId만 담긴 평면 배열을 준다 — 여기서 1depth 트리로 조립한다.
  const { roots, repliesByParent } = useMemo(() => {
    const all = comments ?? [];
    const byParent = new Map<string, PostComment[]>();
    const topLevel: PostComment[] = [];

    for (const comment of all) {
      if (comment.parentId) {
        const list = byParent.get(comment.parentId) ?? [];
        list.push(comment);
        byParent.set(comment.parentId, list);
      } else {
        topLevel.push(comment);
      }
    }
    return { roots: topLevel, repliesByParent: byParent };
  }, [comments]);

  const toggleReplies = (commentId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const handleSubmit = (text: string) => {
    createComment.mutate(
      { body: text, parentId: replyTarget?.commentId },
      {
        onSuccess: () => {
          // 답글을 달면 해당 스레드를 펼쳐둔다 — 안 그러면 방금 쓴 답글이 안 보인다.
          if (replyTarget) {
            setExpandedIds((prev) => new Set(prev).add(replyTarget.commentId));
          }
          setReplyTarget(null);
        },
        onError: (error) => toast.error((error as Error).message),
      }
    );
  };

  const replyTargetName =
    replyTarget?.authorUsername ??
    replyTarget?.authorDisplayName ??
    t('comment.unknownAuthor');

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="h-[48px] flex-row items-center justify-between px-lg">
        <Text variant="label" style={{ color: colors.textPrimary }}>
          {/* 대댓글까지 포함한 전체 개수 — PostCard·DayDetailContent와 같은 기준 */}
          {t('comment.count', { count: comments?.length ?? 0 })}
        </Text>
        {onClose && (
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={{ color: colors.textMuted }}>✕</Text>
          </Pressable>
        )}
      </View>

      <ScrollView className="flex-1 px-lg" showsVerticalScrollIndicator={false}>
        {isLoading && (
          <Text
            variant="body-small"
            style={{ color: colors.textMuted, marginTop: 16 }}
          >
            {t('comment.loading')}
          </Text>
        )}
        {!isLoading && roots.length === 0 && (
          <Text
            variant="body-small"
            style={{ color: colors.textMuted, marginTop: 16 }}
          >
            {t('comment.empty')}
          </Text>
        )}

        {roots.map((comment) => {
          const replies = repliesByParent.get(comment.commentId) ?? [];
          const expanded = expandedIds.has(comment.commentId);

          return (
            <View key={comment.commentId}>
              <CommentRow
                comment={comment}
                postId={postId}
                myId={myId}
                isReply={false}
                colors={colors}
                onPressReply={setReplyTarget}
              />

              {replies.length > 0 && (
                <Pressable
                  onPress={() => toggleReplies(comment.commentId)}
                  hitSlop={4}
                  className="self-start pb-sm"
                  style={{ paddingLeft: REPLY_INDENT_PX }}
                >
                  <Text variant="caption" style={{ color: colors.textMuted }}>
                    {expanded
                      ? t('comment.hideReplies')
                      : t('comment.viewReplies', { count: replies.length })}
                  </Text>
                </Pressable>
              )}

              {expanded &&
                replies.map((reply) => (
                  <CommentRow
                    key={reply.commentId}
                    comment={reply}
                    postId={postId}
                    myId={myId}
                    isReply
                    colors={colors}
                    onPressReply={setReplyTarget}
                  />
                ))}
            </View>
          );
        })}
      </ScrollView>

      <View style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
        {replyTarget && (
          <View className="flex-row items-center justify-between px-md pt-sm">
            <Text variant="caption" style={{ color: colors.textMuted }}>
              {t('comment.replyingTo', { username: replyTargetName })}
            </Text>
            <Pressable onPress={() => setReplyTarget(null)} hitSlop={8}>
              <Text variant="caption" style={{ color: colors.textMuted }}>
                {t('action.cancel')}
              </Text>
            </Pressable>
          </View>
        )}
        <ReplyBar
          variant={variant}
          placeholder={replyTarget ? t('comment.replyPlaceholder') : undefined}
          onSubmit={handleSubmit}
        />
      </View>
    </View>
  );
}
