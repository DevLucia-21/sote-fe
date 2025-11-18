import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NoteType } from './types';
import { notePositions, emotionColors, emotionColorsDark, getEmotionLabel, getStemDirection } from './noteMapping';
import { MusicalNote, getNoteLength } from './MusicalNote';

interface NoteHeadProps {
  note: NoteType;
  emotion: 'JOY' | 'SADNESS' | 'ANGER' | 'APATHY' | 'SENSITIVE';
  score: number;
  contentLength: number;
  onClick?: () => void;
  size?: number; // 쉬운 모드에서 음표 크기 직접 지정
}

export function NoteHead({ note, emotion, score, contentLength, onClick, size }: NoteHeadProps) {  
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const position = notePositions[note];
  if (!position || !position.yOffset) {
    return null;   // note 없음 → 그리지 않음
  }
  
  // 이지모드 확인 (size가 40 또는 50이면 이지모드로 간주)
  const isEasyMode = size === 40 || size === 50;
  const color = isEasyMode ? emotionColorsDark[emotion] : emotionColors[emotion];
  
  const noteLength = getNoteLength(contentLength);
  
  // DO~SOL은 기둥이 위로, SI~HSI는 기둥이 아래로
  const stemDirection = getStemDirection(note);
  
  // 크기 지정이 있으면 사용, 없으면 기본값 (모바일 30, 데스크톱 40)
  const noteSize = size || (isMobile ? 30 : 40);
  const scale = noteSize / 40;
  
  // 기둥 길이 (MusicalNote와 동일하게 scale 적용)
  const stemLength = 50 * scale;
  const padding = 20 * scale;
  
  // 타원 중심이 yOffset 위치에 오도록 배치
  // stemDirection에 따라 SVG 내 타원 위치가 다름
  let yPosition: number;
  if (stemDirection === 'up') {
    // 기둥이 위로: SVG 내에서 타원이 y=(stemLength + padding)에 위치
    yPosition = position.yOffset - (stemLength + padding);
  } else {
    // 기둥이 아래로: SVG 내에서 타원이 y=padding에 위치
    yPosition = position.yOffset - padding;
  }
  
  return (
    <div
      className="absolute cursor-pointer z-20"
      style={{
        top: `${yPosition}px`,
        left: '50%',
        transform: 'translateX(-50%)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Musical note */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative"
        style={{
          filter: `drop-shadow(0 3px 8px rgba(0, 0, 0, 0.25))`,
        }}
      >
        <MusicalNote 
          color={color}
          size={noteSize}
          noteLength={noteLength}
          needsLedgerLine={position.needsLedgerLine}
          stemDirection={stemDirection}
        />
      </motion.div>
      
      {/* Tooltip on hover */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded text-xs text-white pointer-events-none z-50"
          style={{
            backgroundColor: '#4A3228',
          }}
        >
          {getEmotionLabel(emotion)}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid #4A3228',
            }}
          />
        </motion.div>
      )}
    </div>
  );
}