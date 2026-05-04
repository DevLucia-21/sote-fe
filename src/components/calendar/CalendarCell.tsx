import React from 'react';
import { NoteHead } from './NoteHead';
import { QuarterRest } from './QuarterRest';
import { NaturalSignImage } from './NaturalSignImage';
import { DiaryEntry } from './types';
import { getNote } from './noteMapping';

interface CalendarCellProps {
  day?: number;
  isEmpty?: boolean;
  diaryEntry?: DiaryEntry;
  isPastDate?: boolean;
  dateStr?: string;
  onCellClick?: (date: string) => void;
  onRestClick?: (date: string) => void;
  noteSize?: number;
  cellHeight?: number;
  isEasyMode?: boolean;
  isTodayDate?: boolean;
}

export function CalendarCell({
  day,
  isEmpty = false,
  diaryEntry,
  isPastDate = false,
  dateStr = '',
  onCellClick,
  onRestClick,
  noteSize = 35,
  cellHeight = 140,
  isEasyMode = false,
  isTodayDate = false,
}: CalendarCellProps) {
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

  if (isEmpty || !day) {
    return <div style={{ height: `${cellHeight}px` }} />;
  }

  const showRest = !hasEntry && isPastDate;
  const canShowNote =
    hasEntry &&
    diaryEntry &&
    !diaryEntry.analysisDisabled &&
    diaryEntry.emotion &&
    Number.isFinite(Number(diaryEntry.score));
  const note = canShowNote && diaryEntry
    ? diaryEntry.note ?? getNote(diaryEntry.emotion!, Number(diaryEntry.score))
    : undefined;

  return (
    <div
      className={`relative transition-colors ${
        hasEntry || showRest ? 'cursor-pointer hover:bg-[#F0F5E0] dark:hover:bg-[#7B8B4F]/40' : ''
      }`}
      style={{
        height: `${cellHeight}px`,
        boxShadow: isTodayDate ? 'inset 0 0 0 1.5px rgba(123, 139, 79, 0.65)' : undefined,
        borderRadius: isTodayDate ? '12px' : undefined,
      }}
      onClick={hasEntry ? handleClick : undefined}
    >
      <span
        className={`absolute top-2 left-1/2 -translate-x-1/2 text-sm z-10 px-1.5 py-0.5 rounded ${
          hasEntry || isTodayDate ? 'bg-white/90 dark:bg-card/90' : ''
        }`}
        style={{ color: '#4A3228' }}
      >
        {day}
      </span>

      {canShowNote && diaryEntry && (
        <NoteHead
          note={note!}
          emotion={diaryEntry.emotion}
          score={Number(diaryEntry.score)}
          contentLength={diaryEntry.contentLength}
          onClick={handleClick}
          size={noteSize}
        />
      )}

      {hasEntry && !canShowNote && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          title="분석 결과 없음"
        >
          <NaturalSignImage isEasyMode={isEasyMode} />
        </div>
      )}

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
