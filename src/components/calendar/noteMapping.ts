import { EmotionType, NoteType, NotePosition } from './types';

// Emotion color mapping - 파스텔톤 (살짝 진하게)
export const emotionColors: Record<EmotionType, string> = {
  JOY: '#FFE080',      // 파스텔 노랑
  SADNESS: '#90C8FF',  // 파스텔 파랑
  ANGER: '#FFA0A0',    // 파스텔 빨강
  APATHY: '#C8C8C8',   // 파스텔 회색
  SENSITIVE: '#C4B0FF', // 파스텔 보라
};

// 이지모드 전용 진한 색상
export const emotionColorsDark: Record<EmotionType, string> = {
  JOY: '#FFD700',      // 진한 노랑
  SADNESS: '#4A90E2',  // 진한 파랑
  ANGER: '#E74C3C',    // 진한 빨강
  APATHY: '#95A5A6',   // 진한 회색
  SENSITIVE: '#9B59B6', // 진한 보라
};

// Emotion to note mapping
export function getNote(emotion: EmotionType, score: number): NoteType {
  const isHigh = score >= 3.5;
  
  switch (emotion) {
    case 'SADNESS':
      return isHigh ? 'HDO' : 'DO';
    case 'APATHY':
      return isHigh ? 'HMI' : 'MI';
    case 'SENSITIVE':
      return isHigh ? 'HSOL' : 'SOL';
    case 'ANGER':
      return isHigh ? 'HSI' : 'SI';
    case 'JOY':
      return isHigh ? 'HRE' : 'RE';
    default:
      return 'DO';
  }
}

// Note position mapping
// 오선: 첫째줄(100), 둘째줄(86), 셋째줄(72), 넷째줄(58), 다섯째줄(44)
// 간격 14px, 타원 높이 10px, ry = 5
export const notePositions: Record<NoteType, NotePosition> = {
  DO: { note: 'DO', yOffset: 114, needsLedgerLine: true, ledgerLineY: 114 },   // 첫째줄 아래 보조선 (100+14=114)
  RE: { note: 'RE', yOffset: 107, needsLedgerLine: false },                    // 첫째줄 아래 공간 (타원 윗부분이 첫째줄에 닿음: 100+7=107)
  MI: { note: 'MI', yOffset: 100, needsLedgerLine: false },                    // 첫째 줄
  FA: { note: 'FA', yOffset: 93, needsLedgerLine: false },                     // 첫째-둘째 사이
  SOL: { note: 'SOL', yOffset: 86, needsLedgerLine: false },                   // 둘째 줄
  LA: { note: 'LA', yOffset: 79, needsLedgerLine: false },                     // 둘째-셋째 사이
  SI: { note: 'SI', yOffset: 72, needsLedgerLine: false },                     // 셋째 줄
  HDO: { note: 'HDO', yOffset: 65, needsLedgerLine: false },                   // 셋째-넷째 사이
  HRE: { note: 'HRE', yOffset: 58, needsLedgerLine: false },                   // 넷째 줄
  HMI: { note: 'HMI', yOffset: 51, needsLedgerLine: false },                   // 넷째-다섯째 사이
  HFA: { note: 'HFA', yOffset: 44, needsLedgerLine: false },                   // 다섯째 줄
  HSOL: { note: 'HSOL', yOffset: 39, needsLedgerLine: false },                 // 다섯째 줄 위 공간 (타원 밑부분이 다섯째줄에 닿음: 44-5=39)
  HLA: { note: 'HLA', yOffset: 30, needsLedgerLine: false },                   // 위 공간
  HSI: { note: 'HSI', yOffset: 30, needsLedgerLine: true, ledgerLineY: 30 },   // 다섯째 줄 위 보조선(44-14=30)
};

// Get emotion label in Korean
export function getEmotionLabel(emotion: EmotionType): string {
  switch (emotion) {
    case 'JOY':
      return '기쁨';
    case 'SADNESS':
      return '슬픔';
    case 'ANGER':
      return '분노';
    case 'APATHY':
      return '무기력';
    case 'SENSITIVE':
      return '예민';
    default:
      return '';
  }
}

// Determine stem direction based on note
// DO~SOL: 위로, SI~HSI: 아래로
export function getStemDirection(note: NoteType): 'up' | 'down' {
  const upwardNotes: NoteType[] = ['DO', 'RE', 'MI', 'FA', 'SOL', 'LA'];
  return upwardNotes.includes(note) ? 'up' : 'down';
}