import { Image, Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { resolveMediaUrl } from '../lib/resolveMediaUrl';
import { PostVideoThumbnail } from './PostVideoThumbnail';
import type { PostSummary } from '../api/postsApi';

interface PostThumbnailProps {
  post: PostSummary;
  onPress: () => void;
}

export function PostThumbnail({ post, onPress }: PostThumbnailProps) {
  const cover = post.attachments[0];
  const coverUrl = cover ? resolveMediaUrl(cover) : undefined;
  const isVideo = cover?.contentType.startsWith('video/') ?? false;

  return (
    <Pressable
      onPress={onPress}
      style={{ margin: 4 }}
      className="aspect-square flex-1 items-center justify-center overflow-hidden rounded-sm bg-subtle"
    >
      {coverUrl && isVideo ? (
        <>
          <PostVideoThumbnail
            uri={coverUrl}
            style={{ height: '100%', width: '100%' }}
          />
          <View className="absolute h-[28px] w-[28px] items-center justify-center rounded-full bg-black/50">
            <Text className="text-white">▶</Text>
          </View>
        </>
      ) : coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <Text className="text-tertiary">IMG</Text>
      )}
    </Pressable>
  );
}
