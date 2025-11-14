import React from 'react';
import { motion } from 'motion/react';

interface LPDiscProps {
  albumImageUrl: string;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isPlaying?: boolean;
  onClick?: () => void;
  emotionColor?: string;
}

const sizeMap = {
  sm: { outer: 'w-full h-full', inner: 'w-[87.5%] h-[87.5%]', center: 'w-[25%] h-[25%]', rings: 3 },
  md: { outer: 'w-24 h-24', inner: 'w-20 h-20', center: 'w-6 h-6', rings: 4 },
  lg: { outer: 'w-32 h-32', inner: 'w-28 h-28', center: 'w-8 h-8', rings: 5 },
  xl: { outer: 'w-48 h-48', inner: 'w-40 h-40', center: 'w-16 h-16', rings: 5 },
};

export function LPDisc({ 
  albumImageUrl, 
  title, 
  size = 'md', 
  isPlaying = false, 
  onClick,
  emotionColor = '#7B8B4F'
}: LPDiscProps) {
  const sizes = sizeMap[size];

  return (
    <motion.div
      animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
      transition={
        isPlaying
          ? {
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }
          : { duration: 0.5 }
      }
      className={`${sizes.outer} rounded-full flex items-center justify-center shadow-lg cursor-pointer`}
      style={{ backgroundColor: emotionColor }}
      onClick={onClick}
    >
      {/* LP 내부 (검은색 비닐) */}
      <div className={`${sizes.inner} bg-black rounded-full flex items-center justify-center relative overflow-hidden`}>
        {/* LP 홈들 */}
        {Array.from({ length: sizes.rings }).map((_, ring) => {
          const basePercent = 100;
          const ringPercent = basePercent - ring * (size === 'sm' ? 25 : size === 'md' ? 20 : size === 'lg' ? 18 : 18);
          return (
            <div
              key={ring}
              className="absolute border border-gray-600 rounded-full"
              style={{
                width: `${ringPercent}%`,
                height: `${ringPercent}%`,
                opacity: 0.3,
              }}
            />
          );
        })}

        {/* 중앙 라벨 - 앨범 커버 이미지 */}
        <div
          className={`${sizes.center} rounded-full flex items-center justify-center z-10 overflow-hidden`}
          style={{ backgroundColor: '#5D3F35' }}
        >
          <img src={albumImageUrl} alt={title} className="w-full h-full object-cover" />
        </div>

        {/* 회전 애니메이션 표시 */}
        {isPlaying && (
          <div className="absolute inset-0">
            <div className="w-full h-full rounded-full border-t border-white/20" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
