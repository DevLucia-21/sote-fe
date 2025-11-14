import { motion } from 'motion/react';
import { Music2 } from 'lucide-react';
import { Card } from '../ui/card';
import { MusicRecommendation, EmotionType } from './types';
import { emotionStyles } from './mockData';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface MusicCardProps {
  music: MusicRecommendation;
  emotion: EmotionType;
  detailView?: boolean;
}

export function MusicCard({ music, emotion, detailView = false }: MusicCardProps) {
  const style = emotionStyles[emotion] || emotionStyles['기쁨']; // Fallback to default

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="overflow-hidden border-none shadow-lg">
        {/* Header */}
        <div
          className="p-6"
          style={{ backgroundColor: style.backgroundColor }}
        >
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5" style={{ color: style.accentColor }} />
            <h3 style={{ color: style.accentColor }}>
              오늘의 음악 추천
            </h3>
          </div>
        </div>

        {/* Album Cover - only show in analysis result view */}
        {!detailView && (
          <div className="flex justify-center px-6 py-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-48 h-48 rounded-xl shadow-lg overflow-hidden"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400"
                alt={`${music.title} album cover`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        )}

        {/* Music Info */}
        <div className={detailView ? "px-6 pt-6 pb-6" : "px-6 pb-6"}>
          <h4 className="mb-1" style={{ color: style.accentColor }}>
            {music.title}
          </h4>
          <p className="text-muted-foreground mb-1">
            {music.artist}
          </p>
          <p className="text-sm mb-4" style={{ color: '#7B8B4F' }}>
            {music.genre}
          </p>

          {/* Reason */}
          <div className="bg-secondary rounded-xl p-4">
            <p className="text-sm mb-1" style={{ color: '#7B8B4F' }}>추천 이유</p>
            <p className="text-sm">
              {music.reason}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}