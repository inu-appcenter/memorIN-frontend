/* eslint-disable i18next/no-literal-string -- 목데이터(가상 인물 이름·대화)라 번역 대상이 아니다. 실제 API 연동 시 통째로 삭제될 파일. */
export const dummyPeopleArray = [
  '김도윤',
  '이서율',
  '최하린',
  '한소희',
  '정우진',
];

export const stories = [
  '내 기록',
  '홍길동',
  '이서준',
  '박지민',
  '최유나',
  '정우',
];

// 채팅 API가 나오면 entities/chatRoom/api의 실제 타입으로 교체 예정.
export interface DummyChatRoom {
  id: string;
  name: string;
  participants: string[];
  isGroup: boolean;
  memberCount: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const dummyChatRooms: DummyChatRoom[] = [
  {
    id: '1',
    name: '과 동기들',
    participants: ['홍길동', '이지민', '박지호', '김서준'],
    isGroup: true,
    memberCount: 5,
    lastMessage: 'ㅋㅋㅋㅋㅋㅋ',
    lastMessageTime: '오후 9:12',
    unreadCount: 2,
  },
  {
    id: '2',
    name: '홍길동',
    participants: ['홍길동'],
    isGroup: false,
    memberCount: 2,
    lastMessage: '내일 오전 기록 잊지마 ㅋㅋ',
    lastMessageTime: '오후 9:12',
    unreadCount: 2,
  },
  {
    id: '3',
    name: '이지민',
    participants: ['이지민'],
    isGroup: false,
    memberCount: 2,
    lastMessage: '사진 보내줘서 고마워',
    lastMessageTime: '오후 7:40',
    unreadCount: 0,
  },
  {
    id: '4',
    name: '박지호',
    participants: ['박지호'],
    isGroup: false,
    memberCount: 2,
    lastMessage: '오후 기록 봤어 ㅎㅎ',
    lastMessageTime: '어제',
    unreadCount: 0,
  },
];

export interface DummyMessage {
  id: string;
  content: string;
  isMine: boolean;
}

// 목록 스크롤을 확인할 수 있도록 화면 높이를 넘길 만큼 넣어둔다.
export const dummyMessages: DummyMessage[] = [
  { id: '1', content: '안녕! 내일 시간 괜찮아?', isMine: false },
  { id: '2', content: '응 오후엔 괜찮아', isMine: true },
  { id: '3', content: '그럼 카페에서 볼까?', isMine: false },
  { id: '4', content: '좋아 어디로 갈래', isMine: true },
  { id: '5', content: '학교 앞에 새로 생긴 데 어때', isMine: false },
  { id: '6', content: '거기 사진 예쁘게 나오더라', isMine: false },
  { id: '7', content: '오 기록 남기기 좋겠다', isMine: true },
  { id: '8', content: '두시쯤 만나자', isMine: false },
  { id: '9', content: '콜', isMine: true },
  { id: '10', content: '아 그리고 어제 올린 기록 봤어', isMine: false },
  { id: '11', content: '진짜? 어땠어', isMine: true },
  { id: '12', content: '노을 사진 진짜 잘 찍혔더라', isMine: false },
  { id: '13', content: '고마워 ㅎㅎ', isMine: true },
  { id: '14', content: '나도 오후 기록 열심히 써야겠다', isMine: false },
  { id: '15', content: '같이 쓰자', isMine: true },
  { id: '16', content: '내일 카페에서 바로 쓰면 되겠네', isMine: false },
  { id: '17', content: '좋다', isMine: true },
  { id: '18', content: '그럼 내일 봐', isMine: false },
  { id: '19', content: '응 내일 봐!', isMine: true },
  { id: '20', content: '늦지 마 ㅋㅋ', isMine: false },
];
