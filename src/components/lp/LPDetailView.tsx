import React, { useState, useEffect } from 'react';
import api from '../../services/api'
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

// 🔥 emotionType → 한글 라벨 매핑
const emotionLabels: Record<string, string> = {
  JOY: "기쁨",
  SADNESS: "슬픔",
  ANGER: "분노",
  SENSITIVE: "예민",
  APATHY: "무기력",
};

const emotionColors: Record<string, string> = {
  JOY: "#FFE080",
  SADNESS: "#90C8FF",
  ANGER: "#FFA0A0",
  SENSITIVE: "#C4B0FF",
  APATHY: "#C8C8C8",
};

export function LPDetailView({ music, onBack }: LPDetailViewProps) {
  console.log("📌 [LPDetailView] 부모에서 받은 music:", music);
  const [emotionType, setEmotionType] = useState<string | null>(null);
  const [emotionLabel, setEmotionLabel] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  /** 🔥 감정만 API로 불러오기 */
  useEffect(() => {
    async function fetchEmotion() {
      try {
        const diaryRes = await api.get(`/api/diaries?date=${music.rewardDate}`);
        console.log("🎨 상세 감정:", diaryRes.data);

        const type = diaryRes.data?.emotionType || null;

        setEmotionType(type);
        setEmotionLabel(type ? emotionLabels[type] : null);

      } catch (e) {
        console.log("⚠ 감정 없음");
      } finally {
        setLoading(false);
      }
    }

    fetchEmotion();
  }, [music.rewardDate]);

  if (loading) {
    return (
      <div className="p-6 text-center text-[#4A3228] opacity-60">
        불러오는 중...
      </div>
    );
  }

  // 🎨 emotionType 기준 배경색
  const lpBackgroundColor =
    emotionType && emotionColors[emotionType]
      ? emotionColors[emotionType]
      : "#7B8B4F";

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
            <motion.div
              animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
              transition={
                isPlaying
                  ? { duration: 3, repeat: Infinity, ease: 'linear' }
                  : { duration: 0.5 }
              }
              className="w-48 h-48 rounded-full flex items-center justify-center shadow-2xl"
              style={{ backgroundColor: lpBackgroundColor }}
            >
              <div className="w-40 h-40 bg-black rounded-full flex items-center justify-center relative overflow-hidden">
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

                <div className="w-16 h-16 rounded-full overflow-hidden z-10">
                  <img
                    src={music.albumImageUrl}
                    alt={music.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {isPlaying && (
                  <div className="absolute inset-0">
                    <div className="w-full h-full rounded-full border-t border-white/20" />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* 곡 정보 */}
          <div className="text-center mt-6 space-y-2">
            <h2 className="text-2xl text-[#4A3228]">{music.title}</h2>
            <p className="text-lg text-[#4A3228]/70">{music.artist}</p>
            {music.album && (
              <p className="text-sm text-[#4A3228]/60">[ {music.album} ]</p>
            )}

            {music.genre && (
              <div className="pt-2 flex justify-center">
                <Badge
                  variant="secondary"
                  className="text-xs px-3 py-1"
                  style={{
                    backgroundColor: lpBackgroundColor + '30',
                    color: '#4A3228',
                  }}
                >
                  {music.genre}
                </Badge>
              </div>
            )}
          </div>

          {/* 재생 버튼 */}
          <div className="mt-6">
            <Button
              onClick={handlePlayClick}
              size="lg"
              className="w-16 h-16 rounded-full"
              style={{
                backgroundColor: lpBackgroundColor,
                color: '#FFFFFF',
              }}
            >
              {isPlaying ? <Pause /> : <Play className="ml-1" />}
            </Button>
          </div>

          {/* 날짜 & 감정 */}
          <div className="w-full mt-6">
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

                  {emotionType && (
                    <>
                      {console.log("🎨 [Badge 렌더링 체크]", {
                        emotionType,
                        emotionLabel,
                        lpBackgroundColor,
                      })}

                      <Badge
                        variant="secondary"
                        className="text-xs mt-2"
                        style={{
                          backgroundColor: lpBackgroundColor + '30',
                          color: "#6e746eff",
                        }}
                      >
                        {emotionLabel}
                      </Badge>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
