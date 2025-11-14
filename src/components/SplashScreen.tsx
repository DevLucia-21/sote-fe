import React from 'react';
import { Music, Music2 } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ backgroundColor: '#7B8B4F' }}>
      {/* 로고 영역 */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          {/* 악보 5선 */}
          <div className="w-32 h-20 relative">
            {[0, 1, 2, 3, 4].map((line) => (
              <div
                key={line}
                className="absolute w-full h-px bg-white/80"
                style={{ top: `${line * 16}px` }}
              />
            ))}
            
            {/* 음표들 */}
            <div className="absolute top-2 left-4">
              <Music className="w-6 h-6" style={{ color: '#F5F1E8' }} />
            </div>
            <div className="absolute top-6 left-12">
              <Music2 className="w-5 h-5" style={{ color: '#E5E5E5' }} />
            </div>
            <div className="absolute top-4 left-20">
              <Music className="w-6 h-6" style={{ color: '#7B3E2E' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 앱 이름 */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-light mb-4 tracking-wider">
          S<span style={{ color: '#F5F1E8' }}>:</span>ote
        </h1>
        <p className="text-lg text-white/80 italic">
          "하루의 감정을, 한 줄의 멜로디로"
        </p>
      </div>

      {/* 로딩 애니메이션 */}
      <div className="flex space-x-2 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>

      {/* 팀명 */}
      <div className="absolute bottom-8 text-center">
        <p className="text-white/60 text-sm">by Fluxion</p>
      </div>
    </div>
  );
}
