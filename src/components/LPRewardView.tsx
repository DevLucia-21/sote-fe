import React, { useEffect, useState } from 'react';
import api from '../../services/api'
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Play, Pause, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { LPDisc } from './lp/LPDisc';

interface LPRewardViewProps {
  onClose: () => void;
  music: {
    title: string;
    artist: string;
    album: string;
    albumImageUrl: string;
    playUrl?: string;

    // 추가된 항목
    emotionLabel?: string;
    emotionReason?: string;
    emotionScore?: number;
    genre?: string;
    selectedTrackReason?: string;
    trackCover?: string;
    reason: string;
  };
}

export function LPRewardView({ onClose, music }: LPRewardViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const albumImg = music.trackCover || music.albumImageUrl;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardContent className="p-8 space-y-6">

            {/* 축하 메시지 */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: showContent ? 1 : 0,
                y: showContent ? 0 : -20
              }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-2"
            >
              <div className="flex justify-center mb-3">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl text-foreground">
                새로운 LP를 획득했습니다!
              </h2>
              <p className="text-sm text-muted-foreground">
                {music.reason}
              </p>
            </motion.div>

            {/* LP 디스크 */}
            <motion.div
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex justify-center"
            >
              <div className="relative">
                <LPDisc
                  albumImageUrl={albumImg}
                  title={music.title}
                  size="xl"
                  isPlaying={isPlaying}
                  emotionColor="#7B8B4F"
                />

                {/* 재생 버튼 */}
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: showContent ? 1 : 0 }}
                  transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                  onClick={() => {
                    setIsPlaying(!isPlaying)
                    if (music.playUrl) {
                      window.open(music.playUrl, "_blank", "noopener noreferrer");
                    }
                  }}
                  className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full shadow-lg flex items-center justify-center bg-primary"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-1" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* 정보 카드 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-4 bg-muted/30 rounded-lg p-4 border border-border shadow-sm"
            >
              <div>
                <p className="text-xs text-muted-foreground">제목</p>
                <p className="font-medium text-foreground text-base">{music.title}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">아티스트</p>
                <p className="font-medium text-foreground text-sm">{music.artist}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">장르</p>
                <p className="font-medium text-foreground text-sm">{music.genre}</p>
              </div>

              {music.emotionLabel && (
                <div>
                  <p className="text-xs text-muted-foreground">감정 분석</p>
                  <p className="font-medium text-foreground text-sm">
                    {music.emotionLabel} ({(music.emotionScore * 100).toFixed(1)}%)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {music.emotionReason}
                  </p>
                </div>
              )}

              {music.selectedTrackReason && (
                <div>
                  <p className="text-xs text-muted-foreground">선정 이유</p>
                  <p className="text-sm text-foreground">
                    {music.selectedTrackReason}
                  </p>
                </div>
              )}
            </motion.div>

            {/* 버튼 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                onClick={onClose}
                className="w-full bg-primary text-white hover:bg-primary/90"
              >
                확인
              </Button>
            </motion.div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}