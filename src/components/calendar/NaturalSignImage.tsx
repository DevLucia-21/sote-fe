import React from 'react';
import naturalSignImage from '../../assets/natural-sign.svg';

interface NaturalSignImageProps {
  className?: string;
  isEasyMode?: boolean;
}

export function NaturalSignImage({ className, isEasyMode = false }: NaturalSignImageProps) {
  const translateY = isEasyMode ? '-7px' : '3px';

  return (
    <img
      src={naturalSignImage}
      alt="제자리표"
      className={className}
      style={{
        width: '26px',
        height: '56px',
        opacity: 'var(--staff-line-opacity, 0.4)',
        display: 'block',
        transform: `rotate(-8deg) translateY(${translateY})`,
        transformOrigin: 'center',
      }}
    />
  );
}
