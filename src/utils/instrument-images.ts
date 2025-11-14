import type { InstrumentType, EmotionType } from '../types/api';

// 악기 캐릭터 이미지 (목업)
// 실제 이미지로 교체 예정

export const INSTRUMENT_IMAGES = {
  // 기본 이미지
  default: {
    PIANO: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop',
    GUITAR: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop',
    DRUM: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400&h=400&fit=crop',
    VIOLIN: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=400&h=400&fit=crop',
    FLUTE: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop',
  } as Record<InstrumentType, string>,

  // 감정별 이미지
  emotion: {
    PIANO: {
      JOY: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop',
      SADNESS: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop',
      ANGER: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop',
      APATHY: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop',
      SENSITIVE: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop',
    } as Record<EmotionType, string>,
    GUITAR: {
      JOY: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop',
      SADNESS: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop',
      ANGER: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop',
      APATHY: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop',
      SENSITIVE: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop',
    } as Record<EmotionType, string>,
    DRUM: {
      JOY: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400&h=400&fit=crop',
      SADNESS: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400&h=400&fit=crop',
      ANGER: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400&h=400&fit=crop',
      APATHY: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400&h=400&fit=crop',
      SENSITIVE: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400&h=400&fit=crop',
    } as Record<EmotionType, string>,
    VIOLIN: {
      JOY: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=400&h=400&fit=crop',
      SADNESS: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=400&h=400&fit=crop',
      ANGER: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=400&h=400&fit=crop',
      APATHY: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=400&h=400&fit=crop',
      SENSITIVE: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=400&h=400&fit=crop',
    } as Record<EmotionType, string>,
    FLUTE: {
      JOY: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop',
      SADNESS: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop',
      ANGER: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop',
      APATHY: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop',
      SENSITIVE: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop',
    } as Record<EmotionType, string>,
  } as Record<InstrumentType, Record<EmotionType, string>>,
};

/**
 * 악기와 감정에 따른 이미지 URL 반환
 */
export function getInstrumentImage(
  instrument: InstrumentType,
  emotion?: EmotionType
): string {
  if (emotion) {
    return INSTRUMENT_IMAGES.emotion[instrument]?.[emotion] || INSTRUMENT_IMAGES.default[instrument];
  }
  return INSTRUMENT_IMAGES.default[instrument];
}

/**
 * 기본 악기 이미지 URL 반환
 */
export function getDefaultInstrumentImage(instrument: InstrumentType): string {
  return INSTRUMENT_IMAGES.default[instrument];
}
