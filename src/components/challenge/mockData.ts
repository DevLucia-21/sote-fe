import { TodayChallengeStatus, ChallengeDefinitionResponse, ChallengeBadgeResponse, SevenDayProgress, BadgeDefinition } from './types';

// Mock: 오늘의 챌린지 상태 (미추천)
export const mockStatusNotRecommended: TodayChallengeStatus = {
  recommended: false,
  completed: false,
};

// Mock: 오늘의 챌린지 상태 (추천됨)
export const mockStatusRecommended: TodayChallengeStatus = {
  recommended: true,
  completed: false,
  challengeId: 1,
  content: '500보 이상 산책하기',
  emotionType: 'SADNESS',
  category: '운동',
};

// Mock: 오늘의 챌린지 상태 (완료)
export const mockStatusCompleted: TodayChallengeStatus = {
  recommended: true,
  completed: true,
  challengeId: 1,
  content: '500보 이상 산책하기',
  emotionType: 'SADNESS',
  category: '운동',
  completedAt: '2025-10-02T14:30:00',
};

// Mock: 챌린지 정의 목록 (SQL 데이터 기반 - 총 150개)
export const mockChallengeDefinitions: ChallengeDefinitionResponse[] = [
  // SADNESS (30개)
  { id: 1, content: '500보 이상 산책하기', emotionType: 'SADNESS', category: '운동' },
  { id: 2, content: '친구에게 안부 메시지 보내기', emotionType: 'SADNESS', category: '사회' },
  { id: 3, content: '따뜻한 차 마시기', emotionType: 'SADNESS', category: '휴식' },
  { id: 4, content: '좋아하는 노래 듣기', emotionType: 'SADNESS', category: '음악' },
  { id: 5, content: '책 한 줄 필사하기', emotionType: 'SADNESS', category: '루틴' },
  { id: 6, content: '조용한 곳에서 책 30분 읽기', emotionType: 'SADNESS', category: '루틴' },
  { id: 7, content: 'OTT 켜서 처음 나오는 영화 보기', emotionType: 'SADNESS', category: '휴식' },
  { id: 8, content: '캔들 켜고 20분 쉬기', emotionType: 'SADNESS', category: '휴식' },
  { id: 9, content: '미래의 나에게 편지 쓰기', emotionType: 'SADNESS', category: '사회' },
  { id: 10, content: '오늘 마음을 색으로 표현하기', emotionType: 'SADNESS', category: '창작' },
  { id: 11, content: '창문 열고 하늘 보기', emotionType: 'SADNESS', category: '운동' },
  { id: 12, content: '따뜻한 샤워하기', emotionType: 'SADNESS', category: '휴식' },
  { id: 13, content: '가볍게 5분 명상하기', emotionType: 'SADNESS', category: '명상' },
  { id: 14, content: '분리수거 하기', emotionType: 'SADNESS', category: '루틴' },
  { id: 15, content: '클래식 음악 틀기', emotionType: 'SADNESS', category: '음악' },
  { id: 16, content: '모르는 사람이랑 대화하기', emotionType: 'SADNESS', category: '사회' },
  { id: 17, content: '햇볕 받으며 앉아 있기', emotionType: 'SADNESS', category: '휴식' },
  { id: 18, content: '미지근한 물 500ml 마시기', emotionType: 'SADNESS', category: '루틴' },
  { id: 19, content: '달달한 젤리 먹기', emotionType: 'SADNESS', category: '루틴' },
  { id: 20, content: '포근한 이불 속에 있기', emotionType: 'SADNESS', category: '휴식' },
  { id: 21, content: '마음을 편하게 하는 향 맡기', emotionType: 'SADNESS', category: '휴식' },
  { id: 22, content: '짧은 스트레칭', emotionType: 'SADNESS', category: '운동' },
  { id: 23, content: '간단한 그림 그리기', emotionType: 'SADNESS', category: '창작' },
  { id: 24, content: '1년 전 갤러리 보기', emotionType: 'SADNESS', category: '휴식' },
  { id: 25, content: '웃는 얼굴로 셀카 찍기', emotionType: 'SADNESS', category: '음악' },
  { id: 26, content: '설거지 하기', emotionType: 'SADNESS', category: '루틴' },
  { id: 27, content: '내가 좋아하는 것 목록 적기', emotionType: 'SADNESS', category: '루틴' },
  { id: 28, content: '따듯한 차 마시기', emotionType: 'SADNESS', category: '휴식' },
  { id: 29, content: '버킷리스트 3개 적기', emotionType: 'SADNESS', category: '루틴' },
  { id: 30, content: '배경화면 바꿔보기', emotionType: 'SADNESS', category: '루틴' },

  // ANGER (30개)
  { id: 31, content: '심호흡 5분 하기', emotionType: 'ANGER', category: '명상' },
  { id: 32, content: '스트레스 줄여주는 주파수 듣기', emotionType: 'ANGER', category: '음악' },
  { id: 33, content: '5분 이상 산책하기', emotionType: 'ANGER', category: '운동' },
  { id: 34, content: '스트레스 종이에 연필로 적고 찢기', emotionType: 'ANGER', category: '창작' },
  { id: 35, content: '찬물 세수하기', emotionType: 'ANGER', category: '휴식' },
  { id: 36, content: '가벼운 요가 동작', emotionType: 'ANGER', category: '운동' },
  { id: 37, content: '명상 5분 이상 하기', emotionType: 'ANGER', category: '명상' },
  { id: 38, content: '노래방 가기', emotionType: 'ANGER', category: '운동' },
  { id: 39, content: '좋아하는 차 마시기', emotionType: 'ANGER', category: '휴식' },
  { id: 40, content: '상대방에게 하고 싶은 말 편지에 쓰기', emotionType: 'ANGER', category: '창작' },
  { id: 41, content: '집안 정리하기', emotionType: 'ANGER', category: '루틴' },
  { id: 42, content: '책상 청소하기', emotionType: 'ANGER', category: '루틴' },
  { id: 43, content: '아이스크림 먹기', emotionType: 'ANGER', category: '루틴' },
  { id: 44, content: '창문 열고 환기하기', emotionType: 'ANGER', category: '루틴' },
  { id: 45, content: '좋아하는 색으로 낙서하기', emotionType: 'ANGER', category: '창작' },
  { id: 46, content: '찬 물로 손 씻기', emotionType: 'ANGER', category: '휴식' },
  { id: 47, content: '손목 스트레칭', emotionType: 'ANGER', category: '운동' },
  { id: 48, content: '심호흡 10회', emotionType: 'ANGER', category: '명상' },
  { id: 49, content: '얼음물 마시기', emotionType: 'ANGER', category: '휴식' },
  { id: 50, content: '친구랑 5분 전화하기', emotionType: 'ANGER', category: '사회' },
  { id: 51, content: '자연 소리 5분 듣기', emotionType: 'ANGER', category: '휴식' },
  { id: 52, content: '불 끄고 눈 감기', emotionType: 'ANGER', category: '휴식' },
  { id: 53, content: '노트에 화난 감정 쓰기', emotionType: 'ANGER', category: '루틴' },
  { id: 54, content: '화났을 때 내 표정 그리기', emotionType: 'ANGER', category: '창작' },
  { id: 55, content: '매운 음식 먹기', emotionType: 'ANGER', category: '휴식' },
  { id: 56, content: '편의점에서 간단한 간식 사기', emotionType: 'ANGER', category: '루틴' },
  { id: 57, content: '유튜브 들어가서 처음 뜨는 영상 보고 끄기', emotionType: 'ANGER', category: '루틴' },
  { id: 58, content: '재밌는 예능 영상 보기', emotionType: 'ANGER', category: '루틴' },
  { id: 59, content: '양치하기', emotionType: 'ANGER', category: '루틴' },
  { id: 60, content: '좋은 기억 떠올리기', emotionType: 'ANGER', category: '루틴' },

  // APATHY (무기력, 30개)
  { id: 61, content: '기지개 펴기', emotionType: 'APATHY', category: '운동' },
  { id: 62, content: '책 10쪽 읽기', emotionType: 'APATHY', category: '루틴' },
  { id: 63, content: '침대 정리하기', emotionType: 'APATHY', category: '루틴' },
  { id: 64, content: '쓰레기 버리기', emotionType: 'APATHY', category: '루틴' },
  { id: 65, content: '방 5바퀴 돌기', emotionType: 'APATHY', category: '운동' },
  { id: 66, content: '오늘 해야 할 일 1개만 적기', emotionType: 'APATHY', category: '루틴' },
  { id: 67, content: '가방 챙기기', emotionType: 'APATHY', category: '루틴' },
  { id: 68, content: '핸드폰 10분 동안 내려놓고 멍 때리기', emotionType: 'APATHY', category: '루틴' },
  { id: 69, content: '건강체조 따라하기', emotionType: 'APATHY', category: '운동' },
  { id: 70, content: '아침에 창문 열기', emotionType: 'APATHY', category: '루틴' },
  { id: 71, content: '간단한 헤어스타일 변화주기', emotionType: 'APATHY', category: '도전' },
  { id: 72, content: '좋아하는 간식 먹기', emotionType: 'APATHY', category: '루틴' },
  { id: 73, content: '간단한 여행 계획 짜기', emotionType: 'APATHY', category: '도전' },
  { id: 74, content: '샤워하기', emotionType: 'APATHY', category: '루틴' },
  { id: 75, content: '내일 목표 1개 적기', emotionType: 'APATHY', category: '루틴' },
  { id: 76, content: '핸드폰 충전시키기', emotionType: 'APATHY', category: '루틴' },
  { id: 77, content: '지인에게 안부인사 보내기', emotionType: 'APATHY', category: '루틴' },
  { id: 78, content: '가벼운 산책 후 사진 찍기', emotionType: 'APATHY', category: '운동' },
  { id: 79, content: '좋아하는 영화 보기', emotionType: 'APATHY', category: '휴식' },
  { id: 80, content: '영양제 먹기', emotionType: 'APATHY', category: '루틴' },
  { id: 81, content: '편의점 꿀조합 레시피 따라하기', emotionType: 'APATHY', category: '도전' },
  { id: 82, content: '안무영상 보고 따라추기', emotionType: 'APATHY', category: '운동' },
  { id: 83, content: '급작스러운 약속잡기', emotionType: 'APATHY', category: '도전' },
  { id: 84, content: '타자연습 신기록 세우기', emotionType: 'APATHY', category: '도전' },
  { id: 85, content: '꽃 한 송이 사기', emotionType: 'APATHY', category: '운동' },
  { id: 86, content: '신곡 아무거나 들어보기', emotionType: 'APATHY', category: '음악' },
  { id: 87, content: '눈 감고 스크롤 내려서 전화 걸기(기회 3번)', emotionType: 'APATHY', category: '도전' },
  { id: 88, content: '쇼핑 리스트 만들기', emotionType: 'APATHY', category: '창작' },
  { id: 89, content: '입고 싶은 코디 짜기', emotionType: 'APATHY', category: '창작' },
  { id: 90, content: '내가 좋아하는 것 3개 적기', emotionType: 'APATHY', category: '루틴' },

  // SENSITIVE (불안, 30개)
  { id: 91, content: '귀마개 끼고 1시간 있기', emotionType: 'SENSITIVE', category: '휴식' },
  { id: 92, content: '눈을 감고 명상 5분 하기', emotionType: 'SENSITIVE', category: '명상' },
  { id: 93, content: '잠들기 2시간 전 목욕하기', emotionType: 'SENSITIVE', category: '루틴' },
  { id: 94, content: '하루 동안 카페인 섭취 금지하기', emotionType: 'SENSITIVE', category: '도전' },
  { id: 95, content: '말랑이 만지기', emotionType: 'SENSITIVE', category: '루틴' },
  { id: 96, content: '깊은 호흡하기', emotionType: 'SENSITIVE', category: '명상' },
  { id: 97, content: '친구와 이야기 나누기', emotionType: 'SENSITIVE', category: '휴식' },
  { id: 98, content: '불안한 요소 글로 정리하기', emotionType: 'SENSITIVE', category: '창작' },
  { id: 99, content: '동네 예쁜 카페 가기', emotionType: 'SENSITIVE', category: '운동' },
  { id: 100, content: '공원 나가 햇볕 쬐며 앉아있기', emotionType: 'SENSITIVE', category: '휴식' },
  { id: 101, content: '짧은 낮잠 자기', emotionType: 'SENSITIVE', category: '휴식' },
  { id: 102, content: '길고양이 찾으러 가기', emotionType: 'SENSITIVE', category: '운동' },
  { id: 103, content: '핸드폰 끄고 해야할 일 정리하기', emotionType: 'SENSITIVE', category: '루틴' },
  { id: 104, content: 'GPT에게 객관적인 상황 물어보기', emotionType: 'SENSITIVE', category: '사회' },
  { id: 105, content: '사칙연산 문제 10개 풀기', emotionType: 'SENSITIVE', category: '루틴' },
  { id: 106, content: '틀린 그림 찾기하기', emotionType: 'SENSITIVE', category: '도전' },
  { id: 107, content: 'SNS 하루 동안 지우기', emotionType: 'SENSITIVE', category: '도전' },
  { id: 108, content: '거울 보고 활짝 웃기', emotionType: 'SENSITIVE', category: '루틴' },
  { id: 109, content: '잠들기 전 좋은 말 생각하기', emotionType: 'SENSITIVE', category: '루틴' },
  { id: 110, content: '하루 계획 세우고 지키기', emotionType: 'SENSITIVE', category: '창작' },
  { id: 111, content: '러닝 30분 하기', emotionType: 'SENSITIVE', category: '운동' },
  { id: 112, content: '235호흡법 하기', emotionType: 'SENSITIVE', category: '루틴' },
  { id: 113, content: '10분간 생각 멈추기', emotionType: 'SENSITIVE', category: '휴식' },
  { id: 114, content: '종이비행기 날려서 멀리 보내기', emotionType: 'SENSITIVE', category: '도전' },
  { id: 115, content: '왼손으로만 그림 그리기', emotionType: 'SENSITIVE', category: '창작' },
  { id: 116, content: '3분간 방에 있는 초록색 물건 찾기', emotionType: 'SENSITIVE', category: '도전' },
  { id: 117, content: '끝말잇기 50 단어 이어하기', emotionType: 'SENSITIVE', category: '도전' },
  { id: 118, content: '잘 되는 상상하기', emotionType: 'SENSITIVE', category: '창작' },
  { id: 119, content: '손톱깎기', emotionType: 'SENSITIVE', category: '루틴' },
  { id: 120, content: '불안한 요소 쓰고 찢기', emotionType: 'SENSITIVE', category: '루틴' },

  // JOY (기쁨, 30개)
  { id: 121, content: '감사 일기 1줄 작성하기', emotionType: 'JOY', category: '루틴' },
  { id: 122, content: '오늘을 기억할만한 사진 찍기', emotionType: 'JOY', category: '루틴' },
  { id: 123, content: '소소한 간식 즐기기', emotionType: 'JOY', category: '휴식' },
  { id: 124, content: '친구에게 칭찬 메시지 보내기', emotionType: 'JOY', category: '사회' },
  { id: 125, content: '오늘 좋았던 일 3가지 적기', emotionType: 'JOY', category: '루틴' },
  { id: 126, content: '오늘 찍은 사진 보기', emotionType: 'JOY', category: '루틴' },
  { id: 127, content: '음악 크게 틀고 따라 부르기', emotionType: 'JOY', category: '음악' },
  { id: 128, content: '매번 하던 거 살짝 변주주기', emotionType: 'JOY', category: '도전' },
  { id: 129, content: '밝은 색 옷 입어보기', emotionType: 'JOY', category: '루틴' },
  { id: 130, content: '꽃이나 식물 바라보기', emotionType: 'JOY', category: '휴식' },
  { id: 131, content: '오늘 나를 칭찬하기', emotionType: 'JOY', category: '루틴' },
  { id: 132, content: '좋아하는 사람에게 안부 전하기', emotionType: 'JOY', category: '사회' },
  { id: 133, content: '짧은 댄스 해보기', emotionType: 'JOY', category: '운동' },
  { id: 134, content: '맛있는 음료 만들어 마시기', emotionType: 'JOY', category: '루틴' },
  { id: 135, content: '3년 전 추억 사진 꺼내보기', emotionType: 'JOY', category: '휴식' },
  { id: 136, content: '그네 타기', emotionType: 'JOY', category: '루틴' },
  { id: 137, content: '마음에 드는 글귀 필사하기', emotionType: 'JOY', category: '루틴' },
  { id: 138, content: '누군가에게 작은 선물하기', emotionType: 'JOY', category: '사회' },
  { id: 139, content: '내일 먹을 음식 정하기', emotionType: 'JOY', category: '창작' },
  { id: 140, content: '간단한 보드게임 하기', emotionType: 'JOY', category: '놀이' },
  { id: 141, content: '재밌는 썰 만들기', emotionType: 'JOY', category: '창작' },
  { id: 142, content: '내가 잘하는 것 3가지 적기', emotionType: 'JOY', category: '루틴' },
  { id: 143, content: '웃는 얼굴로 셀카 찍기', emotionType: 'JOY', category: '루틴' },
  { id: 144, content: '자잘한 쇼핑하기', emotionType: 'JOY', category: '루틴' },
  { id: 145, content: '평소에 안 입는 옷 입어보기', emotionType: 'JOY', category: '도전' },
  { id: 146, content: '평소 할까말까 했던 거 하기', emotionType: 'JOY', category: '도전' },
  { id: 147, content: '한 달 이상 연락 안 한 친구에게 연락하기', emotionType: 'JOY', category: '도전' },
  { id: 148, content: '방청소하기', emotionType: 'JOY', category: '루틴' },
  { id: 149, content: '옷정리하기', emotionType: 'JOY', category: '루틴' },
  { id: 150, content: 'SNS 프로필 사진 바꾸기', emotionType: 'JOY', category: '루틴' },
];

// Mock: 챌린지 배지 목록 (2025년 10월 기준)
export const mockBadges: ChallengeBadgeResponse[] = [
  {
    badgeId: 1,
    badgeDefinitionId: 1,
    name: '챌린지 입문자',
    description: '어떤 챌린지든 1회 완료',
    conditionCount: 1,
    awardedAt: '2025-10-02T15:00:00',
  },
  {
    badgeId: 2,
    badgeDefinitionId: 2,
    name: '기쁨의 달인 I',
    description: '기쁨 챌린지를 10회 완료',
    emotionType: 'JOY',
    conditionCount: 10,
    awardedAt: '2025-10-03T15:00:00',
  },
  {
    badgeId: 3,
    badgeDefinitionId: 6,
    name: '슬픔 정복자 I',
    description: '슬픔 챌린지를 10회 완료',
    emotionType: 'SADNESS',
    conditionCount: 10,
    awardedAt: '2025-10-06T21:00:00',
  },
  {
    badgeId: 4,
    badgeDefinitionId: 10,
    name: '분노 조절의 달인 I',
    description: '화남 챌린지를 10회 완료',
    emotionType: 'ANGER',
    conditionCount: 10,
    awardedAt: '2025-10-18T20:30:00',
  },
  {
    badgeId: 5,
    badgeDefinitionId: 22,
    name: '운동의 달인 I',
    description: '운동 챌린지를 10회 완료',
    category: '운동',
    conditionCount: 10,
    awardedAt: '2025-10-21T16:00:00',
  },
  {
    badgeId: 6,
    badgeDefinitionId: 26,
    name: '루틴의 달인 I',
    description: '루틴 카테고리 챌린지를 10회 완료',
    category: '루틴',
    conditionCount: 10,
    awardedAt: '2025-10-25T22:30:00',
  },
  {
    badgeId: 7,
    badgeDefinitionId: 38,
    name: '음악 애호가 I',
    description: '음악 카테고리 챌린지를 10회 완료',
    category: '음악',
    conditionCount: 10,
    awardedAt: '2025-10-14T19:00:00',
  },
];

// Mock: 최근 7일 진행 현황 (2025년 10월 기준)
export const mockSevenDayProgress: SevenDayProgress[] = [
  { date: '2025-10-19', completed: false },
  { date: '2025-10-20', completed: true },
  { date: '2025-10-21', completed: true },
  { date: '2025-10-22', completed: false },
  { date: '2025-10-23', completed: true },
  { date: '2025-10-24', completed: false },
  { date: '2025-10-25', completed: true },
];

// Mock: 전체 배지 정의 목록 (4단계 시스템)
export const mockAllBadgeDefinitions: BadgeDefinition[] = [
  // 공통 배지 (4개)
  { id: 1, name: '챌린지 입문자', description: '어떤 챌린지든 1회 완료', conditionCount: 1 },
  { id: 2, name: '챌린지 마스터 I', description: '어떤 챌린지든 10회 완료', conditionCount: 10 },
  { id: 3, name: '챌린지 마스터 II', description: '어떤 챌린지든 20회 완료', conditionCount: 20 },
  { id: 4, name: '챌린지 마스터 III', description: '어떤 챌린지든 30회 완료', conditionCount: 30 },
  
  // 기쁨 감정 배지 (4개)
  { id: 5, name: '기쁨의 달인 I', description: '기쁨 챌린지를 10회 완료', emotionType: 'JOY', conditionCount: 10 },
  { id: 6, name: '기쁨의 달인 II', description: '기쁨 챌린지를 20회 완료', emotionType: 'JOY', conditionCount: 20 },
  { id: 7, name: '기쁨의 달인 III', description: '기쁨 챌린지를 30회 완료', emotionType: 'JOY', conditionCount: 30 },
  { id: 8, name: '기쁨의 마스터', description: '기쁨 챌린지를 50회 이상 완료', emotionType: 'JOY', conditionCount: 50 },
  
  // 슬픔 감정 배지 (4개)
  { id: 9, name: '슬픔 정복자 I', description: '슬픔 챌린지를 10회 완료', emotionType: 'SADNESS', conditionCount: 10 },
  { id: 10, name: '슬픔 정복자 II', description: '슬픔 챌린지를 20회 완료', emotionType: 'SADNESS', conditionCount: 20 },
  { id: 11, name: '슬픔 정복자 III', description: '슬픔 챌린지를 30회 완료', emotionType: 'SADNESS', conditionCount: 30 },
  { id: 12, name: '슬픔의 마스터', description: '슬픔 챌린지를 50회 이상 완료', emotionType: 'SADNESS', conditionCount: 50 },
  
  // 분노 감정 배지 (4개)
  { id: 13, name: '분노 조절의 달인 I', description: '화남 챌린지를 10회 완료', emotionType: 'ANGER', conditionCount: 10 },
  { id: 14, name: '분노 조절의 달인 II', description: '화남 챌린지를 20회 완료', emotionType: 'ANGER', conditionCount: 20 },
  { id: 15, name: '분노 조절의 달인 III', description: '화남 챌린지를 30회 완료', emotionType: 'ANGER', conditionCount: 30 },
  { id: 16, name: '분노의 마스터', description: '화남 챌린지를 50회 이상 완료', emotionType: 'ANGER', conditionCount: 50 },
  
  // 무기력 감정 배지 (4개)
  { id: 17, name: '무기력 극복자 I', description: '무기력 챌린지를 10회 완료', emotionType: 'APATHY', conditionCount: 10 },
  { id: 18, name: '무기력 극복자 II', description: '무기력 챌린지를 20회 완료', emotionType: 'APATHY', conditionCount: 20 },
  { id: 19, name: '무기력 극복자 III', description: '무기력 챌린지를 30회 완료', emotionType: 'APATHY', conditionCount: 30 },
  { id: 20, name: '무기력의 마스터', description: '무기력 챌린지를 50회 이상 완료', emotionType: 'APATHY', conditionCount: 50 },
  
  // 예민 감정 배지 (4개)
  { id: 21, name: '예민함 조절자 I', description: '예민 챌린지를 10회 완료', emotionType: 'SENSITIVE', conditionCount: 10 },
  { id: 22, name: '예민함 조절자 II', description: '예민 챌린지를 20회 완료', emotionType: 'SENSITIVE', conditionCount: 20 },
  { id: 23, name: '예민함 조절자 III', description: '예민 챌린지를 30회 완료', emotionType: 'SENSITIVE', conditionCount: 30 },
  { id: 24, name: '예민의 마스터', description: '예민 챌린지를 50회 이상 완료', emotionType: 'SENSITIVE', conditionCount: 50 },
  
  // 운동 카테고리 배지 (4개)
  { id: 25, name: '운동의 달인 I', description: '운동 챌린지를 10회 완료', category: '운동', conditionCount: 10 },
  { id: 26, name: '운동의 달인 II', description: '운동 챌린지를 20회 완료', category: '운동', conditionCount: 20 },
  { id: 27, name: '운동의 달인 III', description: '운동 챌린지를 30회 완료', category: '운동', conditionCount: 30 },
  { id: 28, name: '운동의 마스터', description: '운동 챌린지를 50회 이상 완료', category: '운동', conditionCount: 50 },
  
  // 루틴 카테고리 배지 (4개)
  { id: 29, name: '루틴의 달인 I', description: '루틴 챌린지를 10회 완료', category: '루틴', conditionCount: 10 },
  { id: 30, name: '루틴의 달인 II', description: '루틴 챌린지를 20회 완료', category: '루틴', conditionCount: 20 },
  { id: 31, name: '루틴의 달인 III', description: '루틴 챌린지를 30회 완료', category: '루틴', conditionCount: 30 },
  { id: 32, name: '루틴의 마스터', description: '루틴 챌린지를 50회 이상 완료', category: '루틴', conditionCount: 50 },
  
  // 도전 카테고리 배지 (4개)
  { id: 33, name: '도전의 달인 I', description: '도전 챌린지를 10회 완료', category: '도전', conditionCount: 10 },
  { id: 34, name: '도전의 달인 II', description: '도전 챌린지를 20회 완료', category: '도전', conditionCount: 20 },
  { id: 35, name: '도전의 달인 III', description: '도전 챌린지를 30회 완료', category: '도전', conditionCount: 30 },
  { id: 36, name: '도전의 마스터', description: '도전 챌린지를 50회 이상 완료', category: '도전', conditionCount: 50 },
  
  // 음악 카테고리 배지 (4개)
  { id: 37, name: '음악 애호가 I', description: '음악 챌린지를 10회 완료', category: '음악', conditionCount: 10 },
  { id: 38, name: '음악 애호가 II', description: '음악 챌린지를 20회 완료', category: '음악', conditionCount: 20 },
  { id: 39, name: '음악 애호가 III', description: '음악 챌린지를 30회 완료', category: '음악', conditionCount: 30 },
  { id: 40, name: '음악의 마스터', description: '음악 챌린지를 50회 이상 완료', category: '음악', conditionCount: 50 },
  
  // 휴식 카테고리 배지 (4개)
  { id: 41, name: '휴식의 달인 I', description: '휴식 챌린지를 10회 완료', category: '휴식', conditionCount: 10 },
  { id: 42, name: '휴식의 달인 II', description: '휴식 챌린지를 20회 완료', category: '휴식', conditionCount: 20 },
  { id: 43, name: '휴식의 달인 III', description: '휴식 챌린지를 30회 완료', category: '휴식', conditionCount: 30 },
  { id: 44, name: '휴식의 마스터', description: '휴식 챌린지를 50회 이상 완료', category: '휴식', conditionCount: 50 },
  
  // 창작 카테고리 배지 (4개)
  { id: 45, name: '창작의 달인 I', description: '창작 챌린지를 10회 완료', category: '창작', conditionCount: 10 },
  { id: 46, name: '창작의 달인 II', description: '창작 챌린지를 20회 완료', category: '창작', conditionCount: 20 },
  { id: 47, name: '창작의 달인 III', description: '창작 챌린지를 30회 완료', category: '창작', conditionCount: 30 },
  { id: 48, name: '창작의 마스터', description: '창작 챌린지를 50회 이상 완료', category: '창작', conditionCount: 50 },
];
