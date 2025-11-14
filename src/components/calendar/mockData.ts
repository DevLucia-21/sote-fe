import { DiaryEntry } from './types';
import { getNote } from './noteMapping';

// Mock diary data for October 2025 - 모든 음표(4종)와 음계를 보여주는 데이터
export const mockDiaryData: DiaryEntry[] = [
  // 8분음표 (eighth) - 50자 이하
  {
    date: '2025-10-02',
    emotion: 'JOY',
    score: 2.8,
    note: getNote('JOY', 2.8),
    content: '기쁨',
    keywords: ['기쁨'],
    writeType: 'TEXT' as const,
    createdAt: '2025-10-02T10:30:00Z',
  },
  // 4분음표 (quarter) - 51~100자
  {
    date: '2025-10-03',
    emotion: 'JOY',
    score: 4.2,
    note: getNote('JOY', 4.2),
    content: '오늘은 정말 기분 좋은 하루였어요! 아침부터 좋은 소식을 들어서 하루 종일 기분이 좋았습니다. 친구와 맛있는 점심도 먹었어요.',
    keywords: ['기쁨', '행복', '친구'],
    writeType: 'TEXT' as const,
    createdAt: '2025-10-03T14:20:00Z',
  },
  // 2분음표 (half) - 101~200자
  {
    date: '2025-10-05',
    emotion: 'SADNESS',
    score: 2.5,
    note: getNote('SADNESS', 2.5),
    content: '오늘은 많이 슬펐어요. 여러 가지 일들이 겹쳐서 힘든 하루였습니다. 아침부터 기분이 좋지 않았고, 하루 종일 우울한 감정이 이어졌어요. 친구와 통화를 했지만 별로 나아지지 않았습니다. 내일은 더 나아지길 바라며 하루를 마무리합니다. 잠을 자면 좀 나아질까요?',
    keywords: ['슬픔', '힘듦'],
    writeType: 'VOICE' as const,
    createdAt: '2025-10-05T20:15:00Z',
  },
  // 전음표 (whole) - 201자 이상
  {
    date: '2025-10-06',
    emotion: 'SADNESS',
    score: 4.0,
    note: getNote('SADNESS', 4.0),
    content: '오늘은 정말 힘든 하루였습니다. 아침부터 모든 일이 꼬이기 시작했고, 그 영향이 하루 종일 이어졌어요. 중요한 미팅에서 실수를 해서 너무 속상했고, 동료들에게도 미안한 마음이 컸습니다. 점심을 먹으면서도 계속 그 생각만 나서 식사도 제대로 못 했어요. 오후에는 추가 업무까지 생겨서 퇴근 시간이 많이 늦어졌습니다. 집에 와서도 마음이 편하지 않네요. 내일은 정말 더 나아지길 바랍니다.',
    keywords: ['슬픔', '힘듦', '업무', '스트레스'],
    writeType: 'TEXT' as const,
    createdAt: '2025-10-06T22:45:00Z',
  },
  // 8분음표
  {
    date: '2025-10-09',
    emotion: 'APATHY',
    score: 2.7,
    note: getNote('APATHY', 2.7),
    content: '무기력해요',
    keywords: ['무기력'],
    writeType: 'HANDWRITING' as const,
    createdAt: '2025-10-09T16:00:00Z',
  },
  // 4분음표
  {
    date: '2025-10-10',
    emotion: 'APATHY',
    score: 3.8,
    note: getNote('APATHY', 3.8),
    content: '무기력한 하루였어요. 아무것도 하고 싶지 않았고, 계속 누워만 있었습니다. 에너지가 하나도 없는 느낌이었어요.',
    keywords: ['무기력', '에너지'],
    writeType: 'TEXT' as const,
    createdAt: '2025-10-10T18:30:00Z',
  },
  // 2분음표
  {
    date: '2025-10-13',
    emotion: 'SENSITIVE',
    score: 3.0,
    note: getNote('SENSITIVE', 3.0),
    content: '예민했던 하루. 작은 일에도 신경이 쓰였어요. 평소보다 감정이 예민해서 사소한 것들이 마음에 걸렸습니다. 친구의 무심한 말 한마디에도 상처를 받았고, 그게 하루 종일 마음에 남았어요. 조금 더 여유를 가져야겠다고 생각했습니다.',
    keywords: ['예민', '감정'],
    writeType: 'VOICE' as const,
    createdAt: '2025-10-13T19:20:00Z',
  },
  // 전음표
  {
    date: '2025-10-14',
    emotion: 'SENSITIVE',
    score: 4.5,
    note: getNote('SENSITIVE', 4.5),
    content: '오늘은 유난히 예민했어요. 아침부터 작은 소음에도 짜증이 났고, 사람들의 시선이 다 불편하게 느껴졌습니다. 평소에는 괜찮던 일들이 오늘따라 너무 신경 쓰였어요. 점심 약속도 취소하고 혼자 조용히 시간을 보냈습니다. 저녁에는 좀 나아졌지만, 여전히 마음이 편하지 않네요. 이런 날도 있는 거겠죠. 내일은 좀 더 평온하길 바랍니다. 충분히 쉬어야겠어요.',
    keywords: ['예민', '감정', '여유', '마음'],
    writeType: 'TEXT' as const,
    createdAt: '2025-10-14T21:00:00Z',
  },
  // 8분음표
  {
    date: '2025-10-17',
    emotion: 'ANGER',
    score: 3.2,
    note: getNote('ANGER', 3.2),
    content: '화가 나요',
    keywords: ['화남'],
    writeType: 'TEXT' as const,
    createdAt: '2025-10-17T11:45:00Z',
  },
  // 4분음표
  {
    date: '2025-10-18',
    emotion: 'ANGER',
    score: 4.3,
    note: getNote('ANGER', 4.3),
    content: '화가 너무 났어요. 억울한 일이 있어서 하루 종일 기분이 좋지 않았습니다. 풀리지 않는 화가 계속 남아있네요.',
    keywords: ['분노', '화남'],
    writeType: 'HANDWRITING' as const,
    createdAt: '2025-10-18T15:30:00Z',
  },
  // 2분음표
  {
    date: '2025-10-21',
    emotion: 'JOY',
    score: 3.5,
    note: getNote('JOY', 3.5),
    content: '오늘은 정말 기분 좋은 하루였어요! 아침부터 좋은 소식을 들어서 하루 종일 기분이 좋았습니다. 친구와 맛있는 점심을 먹으면서 즐거운 대화를 나눴고, 저녁에는 오랜만에 산책을 하며 여유로운 시간을 보냈어요. 날씨도 참 좋았습니다.',
    keywords: ['기쁨', '행복'],
    writeType: 'TEXT' as const,
    createdAt: '2025-10-21T17:20:00Z',
  },
  // 전음표
  {
    date: '2025-10-25',
    emotion: 'SADNESS',
    score: 3.3,
    note: getNote('SADNESS', 3.3),
    content: '슬픔이 밀려왔어요. 특별한 이유는 없는데 그냥 슬픈 날이었습니다. 아침에 일어날 때부터 기분이 가라앉아 있었고, 하루 종일 그 감정이 이어졌어요. 좋아하는 음악을 들어도, 맛있는 걸 먹어도 별로 나아지지 않았습니다. 친구에게 전화를 걸까 했지만 괜히 분위기만 다운시킬 것 같아서 그냥 혼자 있었어요. 내일은 좀 나아지겠죠. 괜찮을 거예요.',
    keywords: ['슬픔', '괜찮음'],
    writeType: 'VOICE' as const,
    createdAt: '2025-10-25T20:00:00Z',
  },
  // 2025-11-10 오늘 일기 (챌린지 테스트용)
  {
    date: '2025-11-10',
    emotion: 'JOY',
    score: 4.5,
    note: getNote('JOY', 4.5),
    content: '오늘은 정말 행복한 하루였어요! 새로운 프로젝트가 시작되어 설레는 마음으로 하루를 시작했습니다. 팀원들과의 회의도 생산적이었고, 아이디어를 나누며 즐거운 시간을 보냈어요. 점심에는 좋아하는 음식을 먹었고, 오후에는 친구에게서 반가운 연락이 와서 더 기분이 좋았습니다. 저녁에는 산책하며 여유를 즐겼어요.',
    keywords: ['기쁨', '행복', '새로운 시작'],
    writeType: 'TEXT' as const,
    createdAt: '2025-11-10T21:30:00Z',
  },
];

// Get diary entry by date
export function getDiaryByDate(date: string): DiaryEntry | undefined {
  return mockDiaryData.find(entry => entry.date === date);
}

// Add diary entry to mockData
export function addDiaryEntry(diary: DiaryEntry): void {
  // Remove existing entry with same date if exists
  const index = mockDiaryData.findIndex(entry => entry.date === diary.date);
  if (index !== -1) {
    mockDiaryData.splice(index, 1);
  }
  // Add new entry
  mockDiaryData.push(diary);
  // Sort by date
  mockDiaryData.sort((a, b) => a.date.localeCompare(b.date));
}