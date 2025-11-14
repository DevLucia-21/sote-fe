import { Diary, Keyword } from './types';

// Mock Keywords
export const mockKeywords: Keyword[] = [
  { id: 1, content: '감사' },
  { id: 2, content: '성찰' },
  { id: 3, content: '희망' },
  { id: 4, content: '불안' },
  { id: 5, content: '행복' },
  { id: 6, content: '우울' },
  { id: 7, content: '고민' },
  { id: 8, content: '성장' },
  { id: 9, content: '위로' },
  { id: 10, content: '평온' }
];

// Mock Diaries - 2025년 10월 데이터로 통일
export const mockDiaries: Diary[] = [
  {
    id: 1,
    date: '2025-10-02',
    content: '기쁨',
    writeType: 'TEXT',
    emotionType: '기쁨',
    emotionScore: 28,
    keywords: ['기쁨'],
    analysisStatus: 'COMPLETED',
    createdAt: '2025-10-02T10:30:00',
    updatedAt: '2025-10-02T10:30:00'
  },
  {
    id: 2,
    date: '2025-10-03',
    content: '오늘은 정말 기분 좋은 하루였어요! 아침부터 좋은 소식을 들어서 하루 종일 기분이 좋았습니다. 친구와 맛있는 점심도 먹었어요.',
    writeType: 'TEXT',
    emotionType: '기쁨',
    emotionScore: 42,
    keywords: ['기쁨', '행복', '친구'],
    analysisStatus: 'COMPLETED',
    createdAt: '2025-10-03T14:20:00',
    updatedAt: '2025-10-03T14:20:00'
  },
  {
    id: 3,
    date: '2025-10-05',
    content: '오늘은 많이 슬펐어요. 여러 가지 일들이 겹쳐서 힘든 하루였습니다. 아침부터 기분이 좋지 않았고, 하루 종일 우울한 감정이 이어졌어요. 친구와 통화를 했지만 별로 나아지지 않았습니다. 내일은 더 나아지길 바라며 하루를 마무리합니다. 잠을 자면 좀 나아질까요?',
    writeType: 'VOICE',
    emotionType: '슬픔',
    emotionScore: 25,
    keywords: ['슬픔', '힘듦'],
    analysisStatus: 'COMPLETED',
    createdAt: '2025-10-05T22:15:00',
    updatedAt: '2025-10-05T22:15:00'
  },
  {
    id: 4,
    date: '2025-10-06',
    content: '오늘은 정말 힘든 하루였습니다. 아침부터 모든 일이 꼬이기 시작했고, 그 영향이 하루 종일 이어졌어요. 중요한 미팅에서 실수를 해서 너무 속상했고, 동료들에게도 미안한 마음이 컸습니다. 점심을 먹으면서도 계속 그 생각만 나서 식사도 제대로 못 했어요. 오후에는 추가 업무까지 생겨서 퇴근 시간이 많이 늦어졌습니다. 집에 와서도 마음이 편하지 않네요. 내일은 정말 더 나아지길 바랍니다.',
    writeType: 'TEXT',
    emotionType: '슬픔',
    emotionScore: 40,
    keywords: ['슬픔', '힘듦', '업무', '스트레스'],
    analysisStatus: 'COMPLETED',
    createdAt: '2025-10-06T20:30:00',
    updatedAt: '2025-10-06T20:30:00'
  },
  {
    id: 5,
    date: '2025-10-09',
    content: '무기력해요',
    writeType: 'HANDWRITING',
    emotionType: '무기력',
    emotionScore: 27,
    keywords: ['무기력'],
    canvasImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    analysisStatus: 'COMPLETED',
    createdAt: '2025-10-09T23:45:00',
    updatedAt: '2025-10-09T23:45:00'
  },
  {
    id: 6,
    date: '2025-10-10',
    content: '무기력한 하루였어요. 아무것도 하고 싶지 않았고, 계속 누워만 있었습니다. 에너지가 하나도 없는 느낌이었어요.',
    writeType: 'TEXT',
    emotionType: '무기력',
    emotionScore: 38,
    keywords: ['무기력', '에너지'],
    analysisStatus: 'COMPLETED',
    createdAt: '2025-10-10T19:00:00',
    updatedAt: '2025-10-10T19:00:00'
  },
  {
    id: 7,
    date: '2025-10-13',
    content: '예민했던 하루. 작은 일에도 신경이 쓰였어요. 평소보다 감정이 예민해서 사소한 것들이 마음에 걸렸습니다. 친구의 무심한 말 한마디에도 상처를 받았고, 그게 하루 종일 마음에 남았어요. 조금 더 여유를 가져야겠다고 생각했습니다.',
    writeType: 'VOICE',
    emotionType: '예민',
    emotionScore: 30,
    keywords: ['예민', '감정'],
    analysisStatus: 'COMPLETED',
    createdAt: '2025-10-13T21:30:00',
    updatedAt: '2025-10-13T21:30:00'
  },
  {
    id: 8,
    date: '2025-10-14',
    content: '오늘은 유난히 예민했어요. 아침부터 작은 소음에도 짜증이 났고, 사람들의 시선이 다 불편하게 느껴졌습니다. 평소에는 괜찮던 일들이 오늘따라 너무 신경 쓰였어요. 점심 약속도 취소하고 혼자 조용히 시간을 보냈습니다. 저녁에는 좀 나아졌지만, 여전히 마음이 편하지 않네요. 이런 날도 있는 거겠죠. 내일은 좀 더 평온하길 바랍니다. 충분히 쉬어야겠어요.',
    writeType: 'TEXT',
    emotionType: '예민',
    emotionScore: 45,
    keywords: ['예민', '감정', '여유', '마음'],
    analysisStatus: 'COMPLETED',
    createdAt: '2025-10-14T18:00:00',
    updatedAt: '2025-10-14T18:00:00'
  },
  {
    id: 9,
    date: '2025-10-17',
    content: '화가 나요',
    writeType: 'TEXT',
    emotionType: '분노',
    emotionScore: 32,
    keywords: ['화남'],
    analysisStatus: 'COMPLETED',
    createdAt: '2025-10-17T16:45:00',
    updatedAt: '2025-10-17T16:45:00'
  },
  {
    id: 10,
    date: '2025-10-18',
    content: '화가 너무 났어요. 억울한 일이 있어서 하루 종일 기분이 좋지 않았습니다. 풀리지 않는 화가 계속 남아있네요.',
    writeType: 'HANDWRITING',
    emotionType: '분노',
    emotionScore: 43,
    keywords: ['분노', '화남'],
    canvasImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    analysisStatus: 'COMPLETED',
    createdAt: '2025-10-18T20:15:00',
    updatedAt: '2025-10-18T20:15:00'
  },
  {
    id: 11,
    date: '2025-10-21',
    content: '오늘은 정말 기분 좋은 하루였어요! 아침부터 좋은 소식을 들어서 하루 종일 기분이 좋았습니다. 친구와 맛있는 점심을 먹으면서 즐거운 대화를 나눴고, 저녁에는 오랜만에 산책을 하며 여유로운 시간을 보냈어요. 날씨도 참 좋았습니다.',
    writeType: 'TEXT',
    emotionType: '기쁨',
    emotionScore: 35,
    keywords: ['기쁨', '행복'],
    analysisStatus: 'COMPLETED',
    createdAt: '2025-10-21T15:30:00',
    updatedAt: '2025-10-21T15:30:00'
  },
  {
    id: 12,
    date: '2025-10-25',
    content: '슬픔이 밀려왔어요. 특별한 이유는 없는데 그냥 슬픈 날이었습니다. 아침에 일어날 때부터 기분이 가라앉아 있었고, 하루 종일 그 감정이 이어졌어요. 좋아하는 음악을 들어도, 맛있는 걸 먹어도 별로 나아지지 않았습니다. 친구에게 전화를 걸까 했지만 괜히 분위기만 다운시킬 것 같아서 그냥 혼자 있었어요. 내일은 좀 나아지겠죠. 괜찮을 거예요.',
    writeType: 'VOICE',
    emotionType: '슬픔',
    emotionScore: 33,
    keywords: ['슬픔', '괜찮음'],
    analysisStatus: 'COMPLETED',
    createdAt: '2025-10-25T22:00:00',
    updatedAt: '2025-10-25T22:00:00'
  }
];

// Helper function to check if diary exists for a date
export const getDiaryByDate = (date: string): Diary | undefined => {
  return mockDiaries.find(d => d.date === date);
};

// Helper function to get diaries in date range
export const getDiariesInRange = (from: string, to: string): Diary[] => {
  return mockDiaries.filter(d => d.date >= from && d.date <= to);
};

// Helper function to check if today's diary exists
export const todayDiaryExists = (): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return mockDiaries.some(d => d.date === today);
};
