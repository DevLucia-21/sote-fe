import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Play, Pause, Disc3, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { LPDisc } from './lp/LPDisc';

interface LPRewardViewProps {
  onClose: () => void;
}

export function LPRewardView({ onClose }: LPRewardViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // 더미 음악 데이터 (일기 분석 후 추천받은 음악)
  const recommendedMusic = {
    title: 'Peaceful Walk',
    artist: 'Calm Journey',
    emotion: 'SADNESS',
    albumImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
    reason: '산책을 하며 마음을 가라앉힐 수 있는 잔잔한 멜로디',
    duration: '4:32',
  };

  useEffect(() => {
    // LP 등장 애니메이션 후 내용 표시
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-background"
    >
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
              animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : -20 }}
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
                챌린지 달성 축하드려요 🎉
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
                {/* LPDisc 컴포넌트 사용 */}
                <LPDisc
                  albumImageUrl={recommendedMusic.albumImageUrl}
                  title={recommendedMusic.title}
                  size="xl"
                  isPlaying={isPlaying}
                  emotionColor="#7B8B4F"
                />

                {/* 재생 버튼 (LP 옆에) */}
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: showContent ? 1 : 0 }}
                  transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                  onClick={() => setIsPlaying(!isPlaying)}
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

            {/* 음악 정보 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
              transition={{ delay: 0.5 }}
              className="text-center space-y-2"
            >
              <h3 className="text-xl text-foreground">
                {recommendedMusic.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {recommendedMusic.artist}
              </p>
            </motion.div>

            {/* 추천 이유 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
              transition={{ delay: 0.6 }}
              className="p-4 rounded-xl text-center bg-muted"
            >
              <p className="text-sm leading-relaxed text-foreground">
                💡 {recommendedMusic.reason}
              </p>
            </motion.div>

            {/* 확인 버튼 */}
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
