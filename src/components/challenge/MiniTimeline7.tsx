import React from 'react';
import { SevenDayProgress } from './types';

interface MiniTimeline7Props {
  progress: SevenDayProgress[];
}

export function MiniTimeline7({ progress }: MiniTimeline7Props) {
  return (
    <div className="flex items-center justify-between gap-2">
      {progress.map((day, index) => {
        const date = new Date(day.date);
        const dayLabel = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
        
        return (
          <div key={index} className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{
                backgroundColor: day.completed ? '#7B8B4F' : 'transparent',
                border: `2px solid ${day.completed ? '#7B8B4F' : '#E5E5E5'}`,
              }}
            >
              {day.completed && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.6667 3.5L5.25 9.91667L2.33333 7"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="text-xs" style={{ color: '#4A3228', opacity: 0.6 }}>
              {dayLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}
