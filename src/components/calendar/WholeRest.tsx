import React from 'react';

interface WholeRestProps {
  className?: string;
  color?: string;
}

// 4분쉼표 SVG (정확한 음악 기호)
export function WholeRest({ className, color }: WholeRestProps) {
  const fillColor = color || 'var(--staff-line-color, #4A3228)';
  const opacity = color ? 1 : 'var(--staff-line-opacity, 0.4)';
  
  return (
    <svg
      className={className}
      width="18"
      height="48"
      viewBox="0 0 18 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 4분쉼표 - 정확한 형태 */}
      <path
        d="M 13 8
           L 15 4
           L 14 6
           C 13 9, 11 12, 9 15
           C 7 18, 5 21, 4 24
           C 3 27, 3 29, 4 31
           C 5 33, 6 35, 8 36
           C 9.5 36.5, 10.5 36, 11 35
           C 11.5 34, 11 33, 10 32.5
           C 9 32, 8 32.5, 7.5 33
           C 7 33.5, 6.5 33, 6 31
           C 5.5 29, 6 27, 7 25
           C 8 23, 10 20, 12 17
           C 14 14, 15 11, 15 8
           L 13 8
           Z"
        fill={fillColor}
        opacity={opacity}
      />
    </svg>
  );
}