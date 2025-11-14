import React from 'react';
import { Card, CardContent } from '../ui/card';
import { EmotionBadge } from './EmotionBadge';
import { WriteTypeBadge } from './WriteTypeBadge';
import { KeywordChip } from './KeywordChip';
import { Diary } from './types';
import { Calendar } from 'lucide-react';

interface DiaryCardProps {
  diary: Diary;
  onClick?: () => void;
  compact?: boolean;
}

export function DiaryCard({ diary, onClick, compact = false }: DiaryCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    return `${month}월 ${day}일 (${dayName})`;
  };

  const getPreviewText = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card
      className={`bg-white transition-all cursor-pointer ${
        compact ? 'hover:shadow-md' : 'hover:shadow-lg hover:scale-[1.01]'
      }`}
      style={{ borderColor: '#E6E0D6' }}
      onClick={onClick}
    >
      <CardContent className={compact ? 'p-4' : 'p-5'}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: '#7B8B4F' }} />
            <p className="text-sm" style={{ color: '#4A3228' }}>
              {formatDate(diary.date)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <WriteTypeBadge writeType={diary.writeType} />
            {diary.emotionType && (
              <EmotionBadge 
                emotion={diary.emotionType} 
                size="sm" 
                score={diary.emotionScore}
                showScore={true}
              />
            )}
          </div>
        </div>

        {/* Content Preview */}
        <p
          className={`text-gray-700 mb-3 ${compact ? 'text-sm line-clamp-2' : 'line-clamp-3'}`}
          style={{ lineHeight: '1.6' }}
        >
          {getPreviewText(diary.content, compact ? 60 : 120)}
        </p>

        {/* Keywords */}
        {diary.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {diary.keywords.slice(0, compact ? 3 : 5).map((keyword, idx) => (
              <KeywordChip key={idx} keyword={keyword} />
            ))}
            {diary.keywords.length > (compact ? 3 : 5) && (
              <span className="text-xs text-gray-400 self-center">
                +{diary.keywords.length - (compact ? 3 : 5)}
              </span>
            )}
          </div>
        )}

        {/* Analysis Status */}
        {diary.analysisStatus && diary.analysisStatus !== 'COMPLETED' && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: '#E6E0D6' }}>
            {diary.analysisStatus === 'PENDING' && (
              <p className="text-xs text-gray-500">감정 분석 대기 중...</p>
            )}
            {diary.analysisStatus === 'IN_PROGRESS' && (
              <p className="text-xs" style={{ color: '#7B8B4F' }}>
                감정 분석 진행 중...
              </p>
            )}
            {diary.analysisStatus === 'FAILED' && (
              <p className="text-xs text-red-500">감정 분석 실패</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}