import React from 'react';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';

// Emotion colors for keywords
const emotionKeywordColors: Record<string, string> = {
  '기쁨': '#F5C842',
  '슬픔': '#5B94CC',
  '분노': '#E04B4B',
  '화남': '#E04B4B',
  '무기력': '#8A8A8A',
  '예민': '#9B76CC',
};

interface KeywordChipProps {
  keyword: string;
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  emotion?: string; // Emotion type for coloring
}

export function KeywordChip({ keyword, selected, onToggle, onRemove, disabled, emotion }: KeywordChipProps) {
  const keywordColor = emotion && emotionKeywordColors[emotion] ? emotionKeywordColors[emotion] : '#7B8B4F';

  if (onRemove) {
    // Removable chip (for editing)
    return (
      <Badge
        variant="outline"
        className="cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors px-3 py-1 flex items-center gap-1.5"
        style={{ borderColor: '#E6E0D6', color: '#4A3228' }}
        onClick={onRemove}
      >
        {keyword}
        <X className="w-3 h-3 text-gray-500 hover:text-red-500" />
      </Badge>
    );
  }

  if (onToggle) {
    // Toggleable chip (for filtering)
    return (
      <Badge
        variant={selected ? 'default' : 'outline'}
        className={`cursor-pointer transition-all px-3 py-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={
          selected
            ? { backgroundColor: '#7B8B4F', color: 'white', borderColor: '#7B8B4F' }
            : { borderColor: '#E6E0D6', color: '#4A3228' }
        }
        onClick={disabled ? undefined : onToggle}
      >
        {keyword}
      </Badge>
    );
  }

  // Read-only chip - apply emotion color if provided
  return (
    <Badge
      variant="outline"
      className="px-3 py-1"
      style={{ 
        borderColor: emotion ? keywordColor : '#E6E0D6', 
        color: emotion ? keywordColor : '#4A3228',
        backgroundColor: emotion ? `${keywordColor}15` : 'transparent'
      }}
    >
      {keyword}
    </Badge>
  );
}