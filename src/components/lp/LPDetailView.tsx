import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Play, Pause, ArrowLeft, Music, Calendar } from 'lucide-react';
import { LPMusic } from './types';

interface LPDetailViewProps {
  music: LPMusic;
  onBack: () => void;
}

// S:ote 감정별 색상 매핑 (파스텔톤)
const emotionColors: Record<string, string> = {
  '기쁨': '#FFE080',      // 파스텔 노랑
  '슬픔': '#90C8FF',      // 파스텔 파랑
  '분노': '#FFA0A0',      // 파스텔 빨강
  '예민': '#C4B0FF',      // 파스텔 보라
  '무기력': '#C8C8C8',    // 파스텔 회색
};

export function LPDetailView({ music, onBack }: LPDetailViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // 감정에 따른 배경색 결정 (감정이 없으면 올리브 그린)
  const lpBackgroundColor = music.emotionLabel 
    ? emotionColors[music.emotionLabel] || '#7B8B4F'
    : '#7B8B4F';

  const handlePlayClick = () => {
    if (!isPlaying) {
      window.open(music.playUrl, '_blank');
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-[#4A3228]">
          <ArrowLeft className="w-5 h-5 mr-2" />
          뒤로
        </Button>
      </div>

      {/* LP 디스크 */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* LP 외곽 */}
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
            className="w-48 h-48 rounded-full flex items-center justify-center shadow-2xl"
            style={{ backgroundColor: lpBackgroundColor }}
          >
            {/* LP 내부 (검은색 비닐) */}
            <div className="w-40 h-40 bg-black rounded-full flex items-center justify-center relative overflow-hidden">
              {/* LP 홈들 */}
              {[0, 1, 2, 3, 4].map((ring) => (
                <div
                  key={ring}
                  className="absolute border border-gray-600 rounded-full"
                  style={{
                    width: `${140 - ring * 25}px`,
                    height: `${140 - ring * 25}px`,
                  }}
                />
              ))}

              {/* 중앙 라벨 - 앨범 커버 이미지 */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center z-10 overflow-hidden"
                style={{ backgroundColor: '#5D3F35' }}
              >
                <img
                  src={music.albumImageUrl}
                  alt={music.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 회전 애니메이션 표시 */}
              {isPlaying && (
                <div className="absolute inset-0">
                  <div className="w-full h-full rounded-full border-t border-white/20" />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* 곡 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-6 space-y-2"
        >
          <h2 className="text-2xl text-[#4A3228]">{music.title}</h2>
          <p className="text-lg" style={{ color: '#4A3228', opacity: 0.7 }}>
            {music.artist}
          </p>
          {music.album && (
            <p className="text-sm" style={{ color: '#4A3228', opacity: 0.6 }}>
              [ {music.album} ]
            </p>
          )}
          {/* 장르 칩 */}
          {music.genre && (
            <div className="pt-2 flex justify-center">
              <Badge
                variant="secondary"
                className="text-xs px-3 py-1"
                style={{
                  backgroundColor: lpBackgroundColor + '30',
                  color: lpBackgroundColor === '#7B8B4F' ? '#7B8B4F' : '#4A3228',
                  border: 'none',
                }}
              >
                {music.genre}
              </Badge>
            </div>
          )}
        </motion.div>

        {/* 재생 버튼 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Button
            onClick={handlePlayClick}
            size="lg"
            className="w-16 h-16 rounded-full"
            style={{
              backgroundColor: lpBackgroundColor,
              color: '#FFFFFF',
            }}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </Button>
        </motion.div>

        {/* 날짜 & 감정 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full mt-6"
        >
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" style={{ color: lpBackgroundColor }} />
                  <span className="text-sm text-[#4A3228]">
                    {new Date(music.rewardDate).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {music.emotionLabel && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: emotionColors[music.emotionLabel] + '20',
                      color: emotionColors[music.emotionLabel] || '#7B8B4F',
                      border: 'none',
                    }}
                  >
                    {music.emotionLabel}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 추천 이유 */}
        {music.reason && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full mt-4"
          >
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#F5F1E8' }}
                  >
                    <Music className="w-4 h-4" style={{ color: lpBackgroundColor }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1 text-[#4A3228]">추천 이유</h4>
                    <p className="text-sm" style={{ color: '#4A3228', opacity: 0.7 }}>
                      {music.reason}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
    </div>
  );
}
