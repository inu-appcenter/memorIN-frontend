import { useState } from 'react';
import { Alert, Platform, Pressable } from 'react-native';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { useFollowUser, useUnfollowUser } from '@/entities/user';
import { useTranslation } from 'react-i18next';

export type FollowRelationState = 'none' | 'pending' | 'following';

interface FollowButtonProps {
  targetUserId: string;
  initialState?: FollowRelationState;
  size?: 'default' | 'small';
  className?: string;
}

export function FollowButton({
  targetUserId,
  initialState = 'none',
  size = 'default',
  className,
}: FollowButtonProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<FollowRelationState>(initialState);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const isBusy = followUser.isPending || unfollowUser.isPending;

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert(t('follow.errorTitle'), message);
    }
  };

  const performUnfollow = () => {
    const previous = state;
    setState('none');
    unfollowUser.mutate(targetUserId, {
      onError: (error) => {
        setState(previous);
        showError((error as Error).message);
      },
    });
  };

  const handlePress = () => {
    if (isBusy) return;

    if (state === 'none') {
      setState('pending');
      followUser.mutate(targetUserId, {
        onError: (error) => {
          setState('none');
          showError((error as Error).message);
        },
      });
      return;
    }

    // 'pending'(내가 보낸 요청 취소)은 되돌리기 쉬운 액션이라 바로 처리하고,
    // 'following'(언팔로우)만 실제 관계를 끊는 거라 확인을 받는다.
    if (state === 'pending') {
      performUnfollow();
      return;
    }

    if (Platform.OS === 'web') {
      if (window.confirm(t('follow.unfollowConfirm'))) {
        performUnfollow();
      }
      return;
    }

    Alert.alert(t('follow.unfollowTitle'), t('follow.unfollowConfirm'), [
      { text: t('action.cancel'), style: 'cancel' },
      {
        text: t('follow.confirm'),
        style: 'destructive',
        onPress: performUnfollow,
      },
    ]);
  };

  const label =
    state === 'none'
      ? t('follow.follow')
      : state === 'pending'
        ? t('follow.requested')
        : t('follow.following');

  return (
    <Pressable
      onPress={handlePress}
      disabled={isBusy}
      className={cn(
        'items-center justify-center rounded-full border',
        size === 'small' ? 'h-[30px] px-md' : 'h-[36px] px-lg',
        state === 'none'
          ? 'border-brand bg-brand active:bg-brand-press'
          : 'border-border bg-subtle active:bg-surface',
        isBusy && 'opacity-50',
        className
      )}
    >
      <Text
        variant="label"
        className={state === 'none' ? 'text-on-brand' : 'text-secondary'}
      >
        {label}
      </Text>
    </Pressable>
  );
}
