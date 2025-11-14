// 감정 타입
export type EmotionType = 'JOY' | 'SADNESS' | 'ANGER' | 'APATHY' | 'SENSITIVE';

// 카테고리 타입 (DB 스키마 기준)
export type ChallengeCategory = '운동' | '루틴' | '도전' | '음악' | '휴식' | '창작' | '명상' | '사회' | '놀이';

// 오늘의 챌린지 상태
export interface TodayChallengeStatus {
  recommended: boolean;
  completed: boolean;
  challengeId?: number;
  content?: string;
  emotionType?: EmotionType;
  category?: ChallengeCategory;
  completedAt?: string;
}

// 챌린지 정의
export interface ChallengeDefinitionResponse {
  id: number;
  content: string;
  emotionType: EmotionType;
  category: ChallengeCategory;
}

// 챌린지 배지 (DB 스키마 기준)
export interface BadgeDefinition {
  id: number;
  name: string;
  description: string;
  emotionType?: EmotionType;
  category?: ChallengeCategory;
  conditionCount: number;
  createdAt?: string;
}

// 유저가 획득한 배지
export interface ChallengeBadgeResponse {
  badgeId: number;
  badgeDefinitionId: number;
  name: string;
  description: string;
  emotionType?: EmotionType;
  category?: ChallengeCategory;
  conditionCount: number;
  awardedAt: string;
}

// 배지와 획득 상태를 합친 인터페이스
export interface BadgeWithStatus extends BadgeDefinition {
  isUnlocked: boolean;
  awardedAt?: string;
  badgeId?: number;
}

// 감정별 색상 매핑
export const EMOTION_COLORS: Record<EmotionType, { bg: string; text: string; border: string }> = {
  JOY: { bg: '#FFF4E6', text: '#E67E22', border: '#F39C12' },
  SADNESS: { bg: '#E3F2FD', text: '#2196F3', border: '#64B5F6' },
  ANGER: { bg: '#FFEBEE', text: '#E53935', border: '#EF5350' },
  APATHY: { bg: '#F5F5F5', text: '#757575', border: '#BDBDBD' },
  SENSITIVE: { bg: '#F3E5F5', text: '#8E24AA', border: '#AB47BC' },
};

// 감정별 한글 이름
export const EMOTION_LABELS: Record<EmotionType, string> = {
  JOY: '기쁨',
  SADNESS: '슬픔',
  ANGER: '분노',
  APATHY: '무기력',
  SENSITIVE: '예민',
};

// 최근 7일 완료 기록
export interface SevenDayProgress {
  date: string;
  completed: boolean;
}
