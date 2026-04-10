// Calendar Types

export type EmotionType = 'JOY' | 'SADNESS' | 'ANGER' | 'APATHY' | 'SENSITIVE';

export type NoteType = 'DO' | 'RE' | 'MI' | 'FA' | 'SOL' | 'LA' | 'SI' |
  'HDO' | 'HRE' | 'HMI' | 'HFA' | 'HSOL' | 'HLA' | 'HSI';

export type WriteType = 'TEXT' | 'VOICE' | 'HANDWRITING';

export interface DiaryEntry {
  date: string; // YYYY-MM-DD
  emotion: EmotionType;
  score: number; // 1-5
  note: NoteType;
  analysisDisabled?: boolean;
  content?: string;
  keywords?: string[];
  writeType?: WriteType;
  createdAt?: string; // 실제 작성 시각 (ISO 8601)
}

export interface NotePosition {
  note: NoteType;
  yOffset: number; // pixels from E4 baseline
  needsLedgerLine: boolean;
  ledgerLineY?: number;
}
