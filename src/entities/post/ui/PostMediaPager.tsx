import { useState } from 'react';
import {
  Image,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Text } from '@/shared/ui/text';
import { cn } from '@/shared/lib/utils';
import { resolveMediaUrl } from '../lib/resolveMediaUrl';
import { PostVideoCover } from './PostVideoCover';
import type { PostMedia } from '../api/postsApi';

interface PostMediaPagerProps {
  attachments: PostMedia[];
}

// 첨부가 여러 장이면 좌우로 넘겨보는 페이저. 한 장이면 스크롤 자체를 막는다.
export function PostMediaPager({ attachments }: PostMediaPagerProps) {
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width <= 0) return;
    setPage(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  if (attachments.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text className="text-tertiary">IMG</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black" onLayout={handleLayout}>
      {width > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          className="flex-1"
          showsHorizontalScrollIndicator={false}
          scrollEnabled={attachments.length > 1}
          onMomentumScrollEnd={handleScrollEnd}
        >
          {attachments.map((media, index) => {
            const uri = resolveMediaUrl(media);
            const isVideo = media.contentType.startsWith('video/');
            return (
              <View
                key={media.objectKey}
                style={{ width }}
                className="h-full items-center justify-center"
              >
                {uri && isVideo ? (
                  // 현재 보고 있는 장만 재생시킨다 (넘기면 이전 장은 자동 정지)
                  <PostVideoCover
                    uri={uri}
                    isVisible={page === index}
                    showPlayPauseToggle
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : uri ? (
                  <Image
                    source={{ uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="text-tertiary">IMG</Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
      {attachments.length > 1 && (
        <View className="absolute bottom-0 w-full flex-row items-center justify-center gap-xs pb-md">
          {attachments.map((media, index) => (
            <View
              key={media.objectKey}
              className={cn(
                'h-[6px] w-[6px] rounded-full',
                index === page ? 'bg-white' : 'bg-white/40'
              )}
            />
          ))}
        </View>
      )}
    </View>
  );
}
