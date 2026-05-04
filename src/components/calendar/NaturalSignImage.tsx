import React from 'react';
import naturalSignImage from '../../assets/natural-sign.svg';

interface NaturalSignImageProps {
  className?: string;
  isEasyMode?: boolean;
  width?: number;
  height?: number;
}

export function NaturalSignImage({
  className,
  isEasyMode = false,
  width = 26,
  height = 56,
}: NaturalSignImageProps) {
  const translateY = isEasyMode ? '-7px' : '3px';

  return (
    <img
      src={naturalSignImage}
      alt="제자리표"
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: 'none',
        opacity: 'var(--staff-line-opacity, 0.4)',
        display: 'block',
        transform: `rotate(-8deg) translateY(${translateY})`,
        transformOrigin: 'center',
      }}
    />
  );
}
