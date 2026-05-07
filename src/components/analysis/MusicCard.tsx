import { motion } from 'motion/react';
import { Music2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { emotionStyles } from './mockData';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface MusicCardProps {
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  coverImageUrl?: string;
  reason?: string;
  emotion: string; // EmotionType
  detailView?: boolean;
}

export function MusicCard({
  title,
  artist,
  album,
  genre,
  coverImageUrl,
  reason,
  emotion,
  detailView = false,
}: MusicCardProps) {
  const style = emotionStyles[emotion] || emotionStyles['기쁨'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="overflow-hidden border-none shadow-lg">

        {/* Header */}
        <div className="p-6" style={{ backgroundColor: style.backgroundColor }}>
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5" style={{ color: style.accentColor }} />
            <h3 style={{ color: style.accentColor }}>오늘의 음악 추천</h3>
          </div>
        </div>

        {!detailView && coverImageUrl && (
          <div className="flex justify-center px-6 py-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-48 h-48 rounded-xl shadow-lg overflow-hidden"
            >
              <ImageWithFallback
                src={coverImageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        )}

        {/* Content */}
        <div className={detailView ? "px-6 pt-6 pb-6" : "px-6 pb-6"}>
          {/* Album */}
          {album && (
            <p className="text-sm mb-2" style={{ color: '#7B8B4F' }}>
              {`[ ${album} ]`}
            </p>
          )}

          {/* Title */}
          <h4 className="text-muted-foreground mb-1">
            {title}
          </h4>

          {/* Artist */}
          <p className="mb-2" style={{ color: style.accentColor }}>{artist}</p>

          {/* Genre */}
          {genre && (
            <Badge
              variant="outline"
              className="px-3 py-1 text-xs"
              style={{
                borderColor: style.accentColor,
                color: style.accentColor,
                backgroundColor: `${style.accentColor}15`,
              }}
            >
              {genre}
            </Badge>
          )}

          {/* Reason */}
          {reason && (
            <div className="bg-secondary rounded-xl p-4 mt-3">
              <p className="text-sm mb-1" style={{ color: '#7B8B4F' }}>추천 이유</p>
              <p className="text-sm leading-relaxed text-foreground/80">
                {reason}
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
