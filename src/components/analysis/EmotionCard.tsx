import { motion } from 'motion/react';
import { Music, Guitar, Piano, Mic2, Smile, Frown, Flame, Battery, Zap } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { EmotionType, InstrumentType } from './types';
import { emotionStyles } from './mockData';
import { getEmotionCharacterImage, CharacterType, EmotionType as EmotionAPIType } from '../common/characterImages';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface EmotionCardProps {
  emotion: EmotionType;
  confidence: number;
  reason: string;
  description: string;
  instrument?: InstrumentType;
  characterType?: CharacterType;
}

const instrumentIcons: Record<InstrumentType, typeof Music> = {
  guitar: Guitar,
  piano: Piano,
  drum: Music,
  violin: Music,
  saxophone: Mic2,
};

const emotionIcons: Record<EmotionType, typeof Smile> = {
  기쁨: Smile,
  슬픔: Frown,
  분노: Flame,
  무기력: Battery,
  예민: Zap,
};

// 감정 한글 → API enum 매핑
const emotionToAPI: Record<EmotionType, EmotionAPIType> = {
  '기쁨': 'JOY',
  '슬픔': 'SADNESS',
  '분노': 'ANGER',
  '무기력': 'APATHY',
  '예민': 'SENSITIVE',
};

export function EmotionCard({
  emotion,
  confidence,
  reason,
  description,
  instrument = 'piano',
  characterType = 'PIANO',
}: EmotionCardProps) {
  const style = emotionStyles[emotion] || emotionStyles['기쁨']; // Fallback to default
  const InstrumentIcon = instrumentIcons[instrument] || instrumentIcons['piano'];
  const EmotionIcon = emotionIcons[emotion] || emotionIcons['기쁨'];

  // 사용자의 악기에 맞는 감정 이미지 가져오기
  const emotionAPI = emotionToAPI[emotion];
  const characterImage = getEmotionCharacterImage(emotionAPI, characterType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-none shadow-lg">
        {/* Header with character */}
        <div
          className="relative p-8 pb-20"
          style={{ backgroundColor: style.backgroundColor }}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="music-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="currentColor" />
                <circle cx="30" cy="30" r="2" fill="currentColor" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#music-pattern)" />
            </svg>
          </div>

          {/* Character */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Floating character with animation */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {characterImage ? (
                <ImageWithFallback
                  src={characterImage}
                  alt={`${emotion} 상태의 악기`}
                  className="w-40 h-40 object-contain"
                />
              ) : (
                <InstrumentIcon
                  className="w-14 h-14"
                  style={{ color: style.accentColor }}
                />
              )}
            </motion.div>
            
            {/* Elliptical shadow */}
            <motion.div
              animate={{ 
                scale: [1, 0.9, 1],
                opacity: [0.35, 0.25, 0.35]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-6 rounded-full mt-2"
              style={{
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 70%)'
              }}
            />
          </motion.div>
        </div>

        {/* Content */}
        <div className="bg-card p-6 -mt-12 relative z-20 rounded-t-3xl">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <EmotionIcon className="w-6 h-6" style={{ color: style.accentColor }} />
              <h2>
                오늘의 감정
              </h2>
            </div>

            {/* Emotion Label and Confidence */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <Badge
                className="px-6 py-2 text-white"
                style={{ backgroundColor: style.accentColor }}
              >
                {emotion}
              </Badge>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm"
                style={{ color: style.accentColor }}
              >
                {confidence}%
              </motion.span>
            </div>

            {/* Reason */}
            <div className="bg-secondary rounded-xl p-4">
              <p className="text-sm mb-1" style={{ color: '#7B8B4F' }}>추천 이유</p>
              <p className="text-sm italic">
                "{reason}"
              </p>
            </div>
          </div>

          {/* Confidence Visual */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">감정 신뢰도</span>
              <span className="text-sm" style={{ color: style.accentColor }}>
                {confidence}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-full rounded-full"
                style={{ backgroundColor: style.accentColor }}
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}