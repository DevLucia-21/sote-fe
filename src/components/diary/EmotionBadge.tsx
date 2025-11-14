import React from 'react';
import { Badge } from '../ui/badge';
import { EmotionType, EMOTION_COLORS } from './types';

interface EmotionBadgeProps {
  emotion: EmotionType;
  size?: 'sm' | 'md' | 'lg';
  score?: number; // 0-100
  showScore?: boolean;
}

export function EmotionBadge({ emotion, size = 'md', score, showScore = false }: EmotionBadgeProps) {
  const colors = EMOTION_COLORS[emotion];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <Badge
      variant="outline"
      className={`${sizeClasses[size]} flex items-center gap-1.5`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border
      }}
    >
      <span>{emotion}</span>
      {showScore && score !== undefined && (
        <span className="font-medium">{score}%</span>
      )}
    </Badge>
  );
}