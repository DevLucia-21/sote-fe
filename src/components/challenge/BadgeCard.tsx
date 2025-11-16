import React from 'react';
import { BadgeWithStatus } from './types';
import { Lock } from 'lucide-react';
import { badgeImages } from '../../utils/badgeImages';

interface BadgeCardProps {
  badge: BadgeWithStatus;
  onClick?: () => void;
}

export function BadgeCard({ badge, onClick }: BadgeCardProps) {
  const getBadgeLevel = () => {
    if (badge.name.includes('마스터')) return '마스터';
    if (badge.name.includes('III')) return 'III';
    if (badge.name.includes('II')) return 'II';
    if (badge.name.includes('I')) return 'I';
    return '입문';
  };

  // 🔥 배지 이름으로 이미지 URL 가져오기
  const badgeImage = badgeImages[badge.name] ?? badgeImages.default;

  return (
    <div
      className="rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md active:scale-95 relative w-full overflow-hidden z-0 bg-card"
      style={{ 
        aspectRatio: '1 / 1',
        padding: 'clamp(0.25rem, 1.5vw, 1rem)',
      }}
      onClick={onClick}
    >
      <div 
        className="flex flex-col h-full justify-center items-center"
        style={{
          gap: 'clamp(0.25rem, 1vw, 1rem)',
        }}
      >
        {/* 🔒 잠금 오버레이 */}
        {!badge.isUnlocked && (
          <div 
            className="absolute inset-0 rounded-lg flex items-center justify-center z-10" 
            style={{ 
              backdropFilter: 'blur(2px)',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            }}
          >
            <div 
              className="rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: 'rgba(90, 90, 90, 0.6)',
                width: 'clamp(2rem, 8vw, 5rem)',
                height: 'clamp(2rem, 8vw, 5rem)',
              }}
            >
              <Lock 
                className="text-muted-foreground"
                style={{ 
                  opacity: 0.8,
                  width: 'clamp(1rem, 4vw, 2.5rem)',
                  height: 'clamp(1rem, 4vw, 2.5rem)',
                }} 
              />
            </div>
          </div>
        )}

        {/* 🔥 레벨 표시 */}
        <div className="flex justify-center w-full flex-shrink-0">
          <span 
            className="rounded inline-block"
            style={{ 
              backgroundColor: badge.isUnlocked ? '#7B8B4F' : 'var(--muted)',
              color: badge.isUnlocked ? '#FFFFFF' : 'var(--muted-foreground)',
              fontWeight: 700,
              lineHeight: 1.2,
              padding: 'clamp(0.0625rem, 0.4vw, 0.25rem) clamp(0.25rem, 1vw, 0.75rem)',
              fontSize: 'clamp(0.375rem, 1.2vw, 1rem)',
            }}
          >
            {getBadgeLevel()}
          </span>
        </div>

        {/* ⭐ 중앙: 이미지 넣기 (Award 아이콘 교체 부분) */}
        <div className="flex justify-center items-center flex-shrink-0">
          <img
            src={badgeImage}
            alt={badge.name}
            style={{
              width: 'clamp(2.5rem, 10vw, 9rem)',
              height: 'clamp(2.5rem, 10vw, 9rem)',
              opacity: badge.isUnlocked ? 1 : 0.4,      // 잠겨있을 때 흐려지게
              filter: badge.isUnlocked ? 'none' : 'grayscale(60%)', // 잠금일 때 흑백 느낌 추가도 가능
            }}
          />
        </div>

        {/* 🔥 이름 */}
        <div className="text-center w-full flex-shrink-0" style={{ padding: '0 clamp(0.125rem, 0.3vw, 0.25rem)' }}>
          <p 
            className="leading-tight line-clamp-2 text-foreground"
            style={{ 
              fontWeight: 700,
              wordBreak: 'keep-all',
              fontSize: 'clamp(0.5rem, 1.3vw, 1.15rem)',
            }}
          >
            {badge.name}
          </p>
        </div>
      </div>
    </div>
  );
}
