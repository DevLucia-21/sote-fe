import React from 'react';
import { EmotionType, EMOTION_COLORS, EMOTION_LABELS } from './types';

interface EmotionChipProps {
  emotion: EmotionType;
  className?: string;
}

export function EmotionChip({ emotion, className = '' }: EmotionChipProps) {
  const colors = EMOTION_COLORS[emotion];
  const label = EMOTION_LABELS[emotion];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full ${className}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {label}
    </span>
  );
}
