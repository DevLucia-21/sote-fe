import React from 'react';
import { StaffLines } from './StaffLines';
import { NoteHead } from './NoteHead';
import { QuarterRest } from './QuarterRest';
import { NaturalSignImage } from './NaturalSignImage';
import { DiaryEntry } from './types';

interface CalendarCellProps {
  day?: number;
  isEmpty?: boolean;
  diaryEntry?: DiaryEntry;
  isPastDate?: boolean;
  dateStr?: string;
  onCellClick?: (date: string) => void;
  onRestClick?: (date: string) => void;
  noteSize?: number; // 쉬운 모드에서 음표 크기 조절
  cellHeight?: number; // 쉬운 모드에서 셀 높이 조절
  isEasyMode?: boolean; // 쉬운 모드 여부
}

export function CalendarCell({ day, isEmpty = false, diaryEntry, isPastDate = false, dateStr = '', onCellClick, onRestClick, noteSize = 35, cellHeight = 140, isEasyMode = false }: CalendarCellProps) {  
  const hasEntry = !!diaryEntry;
  
  const handleClick = () => {
    if (hasEntry && diaryEntry && onCellClick) {
      onCellClick(diaryEntry.date);
    }
  };

  const handleRestClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRestClick && dateStr) {
      onRestClick(dateStr);
    }
  };

  if (diaryEntry) {
  console.log("📌 [CalendarCell] 글자수 확인:", {
    date: diaryEntry.date,
    contentLength: diaryEntry.contentLength,
    emotion: diaryEntry.emotion,
    note: diaryEntry.note
  });
}
  
  // Empty cell (before month starts or after month ends)
  if (isEmpty || !day) {
    return <div style={{ height: `${cellHeight}px` }} />;
  }
  
  // Show quarter rest for past dates without diary entry
  const showRest = !hasEntry && isPastDate;
  
  return (
    <div
      className={`relative transition-colors ${
        hasEntry || showRest ? 'cursor-pointer hover:bg-[#F0F5E0] dark:hover:bg-[#7B8B4F]/40' : ''
      }`}
      style={{ 
        height: `${cellHeight}px`,
      }}
      onClick={hasEntry ? handleClick : undefined}
    >
      {/* Date label */}
      <span
        className={`absolute top-2 left-1/2 -translate-x-1/2 text-sm z-10 px-1.5 py-0.5 rounded ${
          hasEntry ? 'bg-white/90' : ''
        }`}
        style={{ color: '#4A3228' }}
      >
        {day}
      </span>
      
      {/* Note head (only if diary entry exists) */}
      {hasEntry && diaryEntry && !diaryEntry.analysisDisabled && (
        <NoteHead
          note={diaryEntry.note}
          emotion={diaryEntry.emotion}
          score={diaryEntry.score}
          contentLength={diaryEntry.contentLength}
          onClick={handleClick}
          size={noteSize}
        />
      )}

      {hasEntry && diaryEntry?.analysisDisabled && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          title="재작성된 일기"
        >
          <NaturalSignImage />
        </div>
      )}

      {/* Quarter rest (only if no entry and is past date) */}
      {showRest && (
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:opacity-80 transition-opacity z-20"
          onClick={handleRestClick}
          title="과거 일기 작성하기"
        >
          <QuarterRest isEasyMode={isEasyMode} />
        </div>
      )}
    </div>
  );
}
