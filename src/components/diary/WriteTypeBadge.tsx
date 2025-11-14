import React from 'react';
import { Badge } from '../ui/badge';
import { Type, Mic, PenTool } from 'lucide-react';
import { WriteType, WRITE_TYPE_LABELS } from './types';

interface WriteTypeBadgeProps {
  writeType: WriteType;
  size?: 'sm' | 'md';
}

export function WriteTypeBadge({ writeType, size = 'sm' }: WriteTypeBadgeProps) {
  const icons = {
    TEXT: Type,
    STT: Mic,
    OCR: PenTool
  };

  const Icon = icons[writeType];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <Badge
      variant="outline"
      className={`${sizeClasses} flex items-center gap-1`}
      style={{ borderColor: '#E6E0D6', color: '#4A3228' }}
    >
      <Icon className={iconSize} />
      {WRITE_TYPE_LABELS[writeType]}
    </Badge>
  );
}
