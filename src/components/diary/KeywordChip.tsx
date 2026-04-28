import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '../ui/badge';

const emotionKeywordColors: Record<string, string> = {
  '기쁨': '#F5C842',
  '슬픔': '#5B94CC',
  '분노': '#E04B4B',
  '화남': '#E04B4B',
  '불안': '#9B76CC',
  '무기력': '#8A8A8A',
  '예민': '#9B76CC',
  JOY: '#F5C842',
  SADNESS: '#5B94CC',
  ANGER: '#E04B4B',
  APATHY: '#8A8A8A',
  SENSITIVE: '#9B76CC',
};

interface KeywordChipProps {
  keyword: string;
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  emotion?: string;
}

export function KeywordChip({ keyword, selected, onToggle, onRemove, disabled, emotion }: KeywordChipProps) {
  const keywordColor = emotion ? emotionKeywordColors[emotion] || '#7B8B4F' : '#7B8B4F';

  if (onRemove) {
    return (
      <Badge
        variant="outline"
        className="flex cursor-pointer items-center gap-1.5 px-3 py-1 transition-colors hover:border-red-200 hover:bg-red-50"
        style={{ borderColor: '#E6E0D6', color: '#4A3228' }}
        onClick={onRemove}
      >
        {keyword}
        <X className="h-3 w-3 text-gray-500 hover:text-red-500" />
      </Badge>
    );
  }

  if (onToggle) {
    return (
      <Badge
        variant={selected ? 'default' : 'outline'}
        className={`cursor-pointer px-3 py-1 transition-all ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        style={
          selected
            ? { backgroundColor: keywordColor, borderColor: keywordColor, color: 'white' }
            : { backgroundColor: `${keywordColor}15`, borderColor: keywordColor, color: keywordColor }
        }
        onClick={disabled ? undefined : onToggle}
      >
        {keyword}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="px-3 py-1"
      style={{
        backgroundColor: `${keywordColor}15`,
        borderColor: keywordColor,
        color: keywordColor,
      }}
    >
      {keyword}
    </Badge>
  );
}
