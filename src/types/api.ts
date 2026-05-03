// ==================== ENUM TYPES ====================

export type EmotionType = 'JOY' | 'SADNESS' | 'ANGER' | 'APATHY' | 'SENSITIVE';
export type InstrumentType = 'PIANO' | 'GUITAR' | 'DRUM' | 'VIOLIN' | 'FLUTE';
export type WriteType = 'TEXT' | 'OCR' | 'STT';
export type Note = 'DO' | 'RE' | 'MI' | 'FA' | 'SOL' | 'LA' | 'SI' | 'HDO' | 'HRE' | 'HMI' | 'HFA' | 'HSOL' | 'HLA' | 'HSI';

// ==================== EMOTION LABELS ====================

export const EMOTION_LABELS: Record<EmotionType, string> = {
  JOY: '기쁨',
  SADNESS: '슬픔',
  ANGER: '분노',
  APATHY: '무기력',
  SENSITIVE: '예민'
};

export const INSTRUMENT_LABELS: Record<InstrumentType, string> = {
  PIANO: '피아노',
  GUITAR: '기타',
  DRUM: '드럼',
  VIOLIN: '바이올린',
  FLUTE: '플루트'
};

// ==================== AUTH ====================

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  birthDate: string; // "YYYY-MM-DD"
  musicPreferences: number[];
  securityAnswer: string;
  questionId: number;
  character: InstrumentType;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId?: number; // WatchAuth에서 추가됨
}

export interface TokenRequest {
  refreshToken: string;
}

// ==================== USER ====================

export interface FindEmailRequest {
  nickname: string;
  birthDate: string;
  questionId: number;
  securityAnswer: string;
}

export interface FindEmailResponse {
  email: string;
}

export interface FindPwdRequest {
  email: string;
  questionId: number;
  securityAnswer: string;
}

export interface FindPwdResponse {
  tempPassword: string;
}

export interface SecurityCheckRequest {
  email: string;
  questionId: number;
  answer: string;
}

export interface SecurityCheckResponse {
  ok: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ==================== PROFILE ====================

export interface ProfileResponse {
  email: string;
  nickname: string;
  character: InstrumentType;
  birthDate: string;
  hasProfileImage: boolean;
  imageUrl?: string;
  profileImageUrl?: string;
  totalDiaryCount: number;
  savedImageUrls: string[];
  musicPreferenceIds: number[];
}

export interface ProfileUpdateRequest {
  nickname?: string;
  character?: InstrumentType;
  musicPreferences?: number[];
}

// ==================== GENRE ====================

export interface Genre {
  id: number;
  name: string;
}

// ==================== SECURITY QUESTION ====================

export interface SecurityQuestion {
  id: number;
  question: string;
}

// ==================== KEYWORD ====================

export interface KeywordResponse {
  id: number;
  content: string;
}

export interface KeywordCreateRequest {
  content: string;
}

// ==================== DIARY ====================

export interface DiaryDto {
  id: number;
  date: string; // "YYYY-MM-DD"
  content: string;
  writeType: WriteType;
  emotionType?: EmotionType;
  imageUrl?: string;
  keywords: string[];
}

export interface DiaryCreateRequest {
  content: string;
  date: string; // "YYYY-MM-DD"
  keywordIds: number[];
  emotionType?: EmotionType;
}

export interface DiaryUpdateRequest {
  content: string;
  date: string; // "YYYY-MM-DD"
  keywordIds: number[];
  emotionType?: EmotionType;
}

// ==================== ANALYSIS ====================

export interface AnalysisRequest {
  // 빈 객체로 전송
}

export interface AnalysisResponse {
  status: string; // "ok" | "error"
  message: string;
  data?: {
    emotionLabel?: string;
    emotionScore?: number;
    emotionReason?: string;
    selectedTrackTitle?: string;
    selectedTrackArtist?: string;
    selectedTrackAlbum?: string;
    selectedTrackGenre?: string;
    [key: string]: any;
  };
}

export interface AnalysisResultDto {
  analysisDate: string;
  emotionLabel: string;
  emotionScore: number;
  emotionReason: string;
  selectedTrackTitle?: string;
  selectedTrackArtist?: string;
  selectedTrackAlbum?: string;
  selectedTrackGenre?: string;
}

// ==================== OCR ====================

export interface OcrPreviewResponse {
  userId: number;
  text: string;
  imageUrl: string;
  diaryDate: string;
  status: string;
}

export interface OcrRequest {
  userId: number;
  content: string;
  imageUrl: string;
  date: string;
  keywordIds: number[];
  emotionType?: EmotionType;
}

// ==================== STT ====================

export interface SttResultRequest {
  userId: number;
  text: string;
}

export interface SttResult {
  id: number;
  userId: number;
  text: string;
  createdAt: string;
}

// ==================== CHALLENGE ====================

export interface ChallengeDefinitionResponse {
  id: number;
  content: string;
  emotionType: EmotionType;
  category: string;
}

export interface TodayChallengeStatus {
  recommended: boolean;
  completed: boolean;
  challengeId?: number;
  content?: string;
  emotionType?: EmotionType;
  category?: string;
  completedAt?: string;
  reward?: LpRewardResponse; // LP 보상 정보 추가
}

export interface ChallengeBadgeResponse {
  id: number;
  badgeName: string;
  earnedAt: string;
  description?: string;
}

export interface ChallengeHistoryResponse {
  id: number;
  completedAt: string;
  challengeTitle: string;
  challengeCategory: string;
  emotion: EmotionType;
  lpEarned: number;
  badgeEarned?: {
    badgeId: number;
    badgeName: string;
    badgeIcon: string;
  };
}

// ==================== LP REWARD ====================

export interface LpRewardResponse {
  id: number;
  title: string;
  artist: string;
  album: string;
  albumImageUrl?: string;
  playUrl: string;
  rewardDate: string;
  recommendedAt: string;
  genre: string;
  emotion: EmotionType;
  reason: string;
}

// ==================== CALENDAR NOTE ====================

export interface CalendarNoteDto {
  year: number;
  month: number;
  day: number;
  emotion: EmotionType;
  score: number;
  note: Note;
}

// ==================== SETTINGS ====================

export interface NotificationSettingResponse {
  diaryReminder: boolean;
  challengeReminder: boolean;
  reminderTime?: string; // "HH:mm"
}

export interface NotificationSettingRequest {
  diaryReminder: boolean;
  challengeReminder: boolean;
  reminderTime?: string;
}

export interface ThemeSettingResponse {
  darkMode: boolean;
}

export interface ThemeSettingRequest {
  darkMode: boolean;
}

export interface FcmTokenRequest {
  token: string;
}

// ==================== QUESTION ====================

export interface QuestionDto {
  id: number;
  content: string;
  createdAt?: string;
}

export interface QuestionAnswerCreateRequest {
  content: string;
}

export interface QuestionAnswerUpdateRequest {
  content: string;
}

export interface QuestionAnswerResponse {
  id: number;
  questionId: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface QuestionAnswerMonthlyItem {
  answerId: number;
  questionId: number;
  questionContent: string;
  answerContent: string;
  answeredAt: string;
}

// ==================== STATISTICS ====================

export interface DiaryStatsResponse {
  totalCount: number;
  period: string;
  [key: string]: any;
}

export interface AnalysisStatsResponse {
  emotionDistribution: Record<EmotionType, number>;
  averageScore: number;
  period: string;
}

export interface ChallengeCompletionResponse {
  completionRate: number;
  totalChallenges: number;
  completedChallenges: number;
  period: string;
}

export interface ChallengeEmotionPerformanceResponse {
  performanceByEmotion: Record<EmotionType, number>;
  period: string;
}

export interface ChallengeBadgeStatsResponse {
  totalBadges: number;
  badgesByType: Record<string, number>;
  period: string;
}

export interface MusicStatsResponse {
  monthlyCount: number;
  emotionGenreMapping: Record<string, Record<string, number>>;
}

export interface KeywordRankingResponse {
  rankings: Array<{ keyword: string; count: number; rank: number }>;
  period: string;
}

export interface KeywordEmotionRankingResponse {
  emotionKeywords: Record<EmotionType, Array<{ keyword: string; count: number }>>;
  period: string;
}

export interface KeywordExploreResponse {
  allKeywords: Array<{ keyword: string; count: number; emotions: EmotionType[] }>;
  period: string;
}

// ==================== STRESS ====================

export interface StressDto {
  id: number;
  hrv: number;
  stressLevel: number;
  measuredAt: string;
}

// ==================== WATCH AUTH ====================

export interface WatchPairCodeResponse {
  code: string; // 백엔드: code (pairCode 아님!)
  expiresAt: string; // ISO 8601 format (LocalDateTime.toString())
}

export interface WatchPairLoginRequest {
  code: string; // 백엔드는 'code' 필드명 사용
}

// ==================== HEALTH DATA ====================

export interface HealthRequest {
  userId: number;
  heartRate?: number; // Double
  hrv?: number; // Double
  steps?: number; // Integer
  measuredAt?: string; // ISO DateTime (e.g., "2024-01-15T08:30:00")
}

export interface HealthResponse {
  id: number;
  userId: number;
  heartRate?: number; // Double
  hrv?: number; // Double
  steps?: number; // Integer
  measuredAt?: string; // LocalDateTime.toString()
  createdAt?: string; // LocalDateTime.toString()
}

export interface HealthSummaryResponse {
  date: string; // yyyy-MM-dd
  avgHeartRate?: number; // Double
  avgHrv?: number; // Double
  avgSteps?: number; // Double
}

// 워치에서 보낼 때 사용 (userId 없음, 토큰으로 인증)
export interface WatchHealthRequest {
  heartRate?: number; // Double
  hrv?: number; // Double
  steps?: number; // Integer
  measuredAt?: string; // ISO 8601: "2025-11-13T14:23:00+09:00"
}
