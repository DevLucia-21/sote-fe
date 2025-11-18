// Diary types and interfaces

export type WriteType = 'TEXT' | 'VOICE' | 'HANDWRITING';
export type EmotionType = '기쁨' | '슬픔' | '분노' | '화남' | '예민' | '무기력';
export type AnalysisStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface Diary {
  id: number;
  date: string; // YYYY-MM-DD
  content: string;
  writeType: WriteType;
  emotionType?: EmotionType;
  emotionScore?: number; // 0-100, 감정 분석 신뢰도/강도
  imageUrl?: string; // OCR용 (업로드한 이미지)
  canvasImage?: string; // 손글씨 캔버스 이미지 (base64)
  keywords: string[];
  analysisStatus?: AnalysisStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Keyword {
  id: number;
  content: string;
}

export interface DiaryFilter {
  period?: 'week' | 'month' | 'custom';
  dateFrom?: string;
  dateTo?: string;
  keywords?: number[];
  searchText?: string;
}

export const EMOTION_COLORS: Record<EmotionType, { bg: string; text: string; border: string }> = {
  '기쁨': { bg: '#FFF9E6', text: '#F59E0B', border: '#FDE68A' },
  '슬픔': { bg: '#EFF6FF', text: '#3B82F6', border: '#BFDBFE' },
  '분노': { bg: '#FEE2E2', text: '#EF4444', border: '#FECACA' },
  '화남': { bg: '#FEE2E2', text: '#EF4444', border: '#FECACA' },
  '예민': { bg: '#F3E8FF', text: '#A855F7', border: '#E9D5FF' },
  '무기력': { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' }
};

export const WRITE_TYPE_LABELS: Record<WriteType, string> = {
  'TEXT': '텍스트',
  'VOICE': '음성',
  'HANDWRITING': '손글씨'
};