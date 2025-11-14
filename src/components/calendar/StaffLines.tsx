import React from 'react';

interface StaffLinesProps {
  className?: string;
}

export function StaffLines({ className = '' }: StaffLinesProps) {
  // 셀 높이 140px
  // 오선을 중앙에 배치하되 하단에 여유 공간을 확보
  // 오선 5줄 - 간격 14px
  // 첫째줄(맨 아래): 100px
  // 둘째줄: 86px
  // 셋째줄: 72px
  // 넷째줄: 58px
  // 다섯째줄: 44px
  
  const staffLines = [100, 86, 72, 58, 44];
  
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* 5 lines of the staff */}
      {staffLines.map((yPos, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            top: `${yPos}px`,
            left: '6%',
            width: '88%',
            height: '1.5px',
            backgroundColor: 'var(--staff-line-color, #4A3228)',
            opacity: 'var(--staff-line-opacity, 0.4)',
          }}
        />
      ))}
    </div>
  );
}