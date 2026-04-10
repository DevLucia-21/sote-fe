import React from 'react';
import naturalSignImage from '../../assets/natural-sign.svg';

interface NaturalSignImageProps {
  className?: string;
}

export function NaturalSignImage({ className }: NaturalSignImageProps) {
  return (
    <img
      src={naturalSignImage}
      alt="제자리표"
      className={className}
      style={{
        width: '26px',
        height: '56px',
        display: 'block',
        transform: 'rotate(-8deg) translateY(4px)',
        transformOrigin: 'center',
      }}
    />
  );
}
