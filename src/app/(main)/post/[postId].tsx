import { useLocalSearchParams } from 'expo-router';
import { PostDetailPage } from '@/pages/postDetail';

export default function PostDetailRoute() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  return <PostDetailPage postId={postId} />;
}
