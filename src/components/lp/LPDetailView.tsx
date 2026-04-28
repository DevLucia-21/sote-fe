import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Music, Pause, Play } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { LPMusic } from './types';

interface LPDetailViewProps {
  music: LPMusic;
  onBack: () => void;
}

const emotionLabels: Record<string, string> = {
  JOY: '기쁨',
  SADNESS: '슬픔',
  ANGER: '분노',
  SENSITIVE: '예민',
  APATHY: '무기력',
};

const emotionColors: Record<string, string> = {
  JOY: '#FFE080',
  SADNESS: '#90C8FF',
  ANGER: '#FFA0A0',
  SENSITIVE: '#C4B0FF',
  APATHY: '#C8C8C8',
};

const emotionAccentColors: Record<string, string> = {
  JOY: '#B77900',
  SADNESS: '#2563EB',
  ANGER: '#DC2626',
  SENSITIVE: '#7C3AED',
  APATHY: '#6B7280',
};

const emotionTypeByLabel: Record<string, string> = {
  기쁨: 'JOY',
  슬픔: 'SADNESS',
  분노: 'ANGER',
  화남: 'ANGER',
  예민: 'SENSITIVE',
  무기력: 'APATHY',
};

export function LPDetailView({ music, onBack }: LPDetailViewProps) {
  const [emotionType, setEmotionType] = useState<string | null>(null);
  const [emotionLabel, setEmotionLabel] = useState<string | null>(null);
  const [extraInfo, setExtraInfo] = useState({ genre: '', reason: '' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const diaryRes = await api.get(`/api/diaries?date=${music.rewardDate}`);
        const diary = diaryRes.data;
        const diaryEmotionType = diary?.emotionType || null;

        if (diaryEmotionType) {
          setEmotionType(diaryEmotionType);
          setEmotionLabel(emotionLabels[diaryEmotionType] || diaryEmotionType);
        }

        if (!diary?.id) {
          return;
        }

        const analysisRes = await api.get(`/api/analysis/${diary.id}`);
        const result = analysisRes.data;
        const label = result?.emotionLabel || null;
        const type = result?.emotionType || emotionTypeByLabel[label] || diaryEmotionType;

        if (type) {
          setEmotionType(type);
          setEmotionLabel(emotionLabels[type] || label);
        }

        setExtraInfo({
          genre: result?.selectedTrackGenre || '',
          reason: result?.selectedTrackReason || '',
        });
      } catch (err) {
        console.error('LP 상세 정보를 불러오지 못했습니다:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [music.rewardDate]);

  const lpBackgroundColor = emotionType && emotionColors[emotionType] ? emotionColors[emotionType] : '#7B8B4F';
  const lpAccentColor = emotionType && emotionAccentColors[emotionType] ? emotionAccentColors[emotionType] : '#7B8B4F';

  const handlePlayClick = () => {
    if (!isPlaying && music.playUrl) {
      window.open(music.playUrl, '_blank');
    }
    setIsPlaying((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-foreground">
            <ArrowLeft className="mr-2 h-5 w-5" />
            뒤로
          </Button>
        </div>

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
              className="flex h-48 w-48 items-center justify-center rounded-full shadow-2xl"
              style={{ backgroundColor: lpBackgroundColor }}
            >
              <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-black">
                {[0, 1, 2, 3, 4].map((ring) => (
                  <div
                    key={ring}
                    className="absolute rounded-full border border-gray-600"
                    style={{
                      width: `${140 - ring * 25}px`,
                      height: `${140 - ring * 25}px`,
                    }}
                  />
                ))}

                <div className="z-10 h-16 w-16 overflow-hidden rounded-full">
                  <img
                    src={music.albumImageUrl}
                    alt={music.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {isPlaying && (
                  <div className="absolute inset-0">
                    <div className="h-full w-full rounded-full border-t border-white/20" />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          <div className="mt-6 space-y-2 text-center">
            <h2 className="text-2xl text-foreground">{music.title}</h2>
            <p className="text-lg text-muted-foreground">{music.artist}</p>
            {music.album && <p className="text-sm text-muted-foreground">[ {music.album} ]</p>}

            {music.genre && (
              <div className="flex justify-center pt-2">
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-xs"
                  style={{
                    backgroundColor: `${lpBackgroundColor}20`,
                    borderColor: lpAccentColor,
                    color: lpAccentColor,
                  }}
                >
                  {music.genre}
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button
              onClick={handlePlayClick}
              size="lg"
              className="h-16 w-16 rounded-full text-white"
              style={{ backgroundColor: lpBackgroundColor }}
            >
              {isPlaying ? <Pause /> : <Play className="ml-1" />}
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6 w-full"
          >
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" style={{ color: lpBackgroundColor }} />
                    <span className="text-sm text-foreground">
                      {new Date(music.rewardDate).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {emotionLabel && (
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        backgroundColor: `${lpBackgroundColor}20`,
                        borderColor: lpAccentColor,
                        color: lpAccentColor,
                      }}
                    >
                      {emotionLabel}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {extraInfo.reason && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 w-full"
            >
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border shadow-sm"
                      style={{
                        backgroundColor: `${lpBackgroundColor}24`,
                        borderColor: lpAccentColor,
                      }}
                    >
                      <Music className="h-4 w-4 drop-shadow-sm" style={{ color: lpAccentColor }} />
                    </div>

                    <div className="flex-1">
                      <h4 className="mb-1 font-medium text-foreground">추천 이유</h4>
                      <p className="text-sm text-muted-foreground">{extraInfo.reason}</p>
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
