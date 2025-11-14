import React from 'react';
import quarterRestImage from 'figma:asset/3026eee15f31f75efbf2684ea5a723ef3fdd89fc.png';

interface QuarterRestProps {
  className?: string;
  color?: string;
  isEasyMode?: boolean;
}

// 4분쉼표 이미지
export function QuarterRest({ className, color, isEasyMode = false }: QuarterRestProps) {
  const opacity = color ? 0.5 : 'var(--staff-line-opacity, 0.4)';
  const translateY = isEasyMode ? '-7px' : '3px';
  
  return (
    <img
      src={quarterRestImage}
      alt="4분쉼표"
      className={className}
      style={{
        width: '20px',
        height: '50px',
        opacity: opacity,
        filter: color ? `brightness(0) saturate(100%) ${getColorFilter(color)}` : undefined,
        transform: `translateY(${translateY})`,
      }}
    />
  );
}

// Helper function to convert hex color to CSS filter (approximate)
function getColorFilter(hexColor: string): string {
  // For simplicity, just return the original color approach
  // In a real implementation, you would convert hex to filter values
  return '';
}