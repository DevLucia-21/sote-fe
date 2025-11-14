// Analysis Types

export type EmotionType = '기쁨' | '슬픔' | '분노' | '예민' | '무기력';

export type InstrumentType = 'guitar' | 'piano' | 'drum' | 'violin' | 'saxophone';

export interface AnalysisResult {
  id: string;
  date: string;
  emotion: EmotionType;
  confidence: number; // 0-100
  reason: string;
  description: string;
  music?: MusicRecommendation; // Optional: 쉬운 사용 모드에서는 undefined
  challenge?: ChallengeRecommendation; // Optional: 과거 일기 작성 시 undefined
}

export interface MusicRecommendation {
  title: string;
  artist: string;
  genre: string;
  albumCover?: string;
  reason: string;
}

export interface ChallengeRecommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  emotion: EmotionType;
}

export type AnalysisStage = 'text' | 'emotion' | 'music';

export interface AnalysisProgress {
  stage: AnalysisStage;
  progress: number; // 0-100
  message: string;
}

export interface EmotionStyle {
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  characterMood: string;
}