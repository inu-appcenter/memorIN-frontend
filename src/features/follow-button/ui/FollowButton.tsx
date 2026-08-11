import { useState } from 'react';
import { Alert, Platform, Pressable } from 'react-native';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { useFollowUser, useUnfollowUser } from '@/entities/user';

// 이 버튼이 표현할 수 있는 상태는 백엔드 제약 때문에 정확하지 않을 수 있다.
// - UserSearchResponse에 팔로우 상태가 안 내려오기 때문에(설계안 Gap A),
//   검색 화면에서는 항상 'none'으로 시작한다. 이미 팔로우/요청 중인 상대를
//   검색해도 화면 새로고침 전까지는 이 버튼만 보고는 알 수 없다.
// - 'pending'과 'following' 클릭은 둘 다 같은 DELETE 엔드포인트(unfollow)를 쓴다 —
//   백엔드가 follower/following 쌍으로만 관계를 지우기 때문에 PENDING 취소와
//   ACCEPTED 언팔로우를 구분하지 않는다.
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
  const [state, setState] = useState<FollowRelationState>(initialState);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const isBusy = followUser.isPending || unfollowUser.isPending;

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('오류', message);
    }
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

    // pending(내가 보낸 요청 취소) / following(언팔로우) 둘 다 같은 액션
    const previous = state;
    setState('none');
    unfollowUser.mutate(targetUserId, {
      onError: (error) => {
        setState(previous);
        showError((error as Error).message);
      },
    });
  };

  const label =
    state === 'none' ? '팔로우' : state === 'pending' ? '요청됨' : '팔로잉';

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
