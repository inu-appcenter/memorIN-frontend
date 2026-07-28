// 댓글 mock 데이터 — 백엔드에 댓글 API(컨트롤러)가 아직 없어서(post_comments 도메인에
// 엔티티/서비스는 있지만 REST 엔드포인트 없음, 2026-07-28 기준) 임시로 사용한다.
// 백엔드 연동 후 이 파일과 StoryComments/StoryViewer의 로컬 상태를 실제 API 호출로 교체할 것.
export interface StoryComment {
  id: string;
  author: string;
  timeAgo: string;
  text: string;
  likes: number;
}

export const INITIAL_MOCK_COMMENTS: StoryComment[] = [
  {
    id: '1',
    author: '박지호',
    timeAgo: '2분',
    text: '사진 진짜 감성 있다 🌿',
    likes: 3,
  },
  {
    id: '2',
    author: '수진',
    timeAgo: '5분',
    text: '아침 산책 좋았겠다!',
    likes: 1,
  },
  {
    id: '3',
    author: '민재',
    timeAgo: '12분',
    text: '여기 어디야? 나도 가보고 싶어',
    likes: 0,
  },
  {
    id: '4',
    author: '하늘',
    timeAgo: '20분',
    text: '오늘도 기록 완료 💪',
    likes: 2,
  },
  {
    id: '5',
    author: '서울',
    timeAgo: '32분',
    text: '노을 사진도 올려줘~',
    likes: 1,
  },
];
