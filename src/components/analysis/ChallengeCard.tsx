import { motion } from 'motion/react';
import { Target, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ChallengeRecommendation, EmotionType } from './types';
import { emotionStyles } from './mockData';

interface ChallengeCardProps {
  challenge: ChallengeRecommendation;
  emotion: EmotionType;
  onAcceptChallenge?: () => void;
  detailView?: boolean;
}

export function ChallengeCard({ challenge, emotion, onAcceptChallenge, detailView = false }: ChallengeCardProps) {
  const style = emotionStyles[emotion] || emotionStyles['기쁨']; // Fallback to default

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="overflow-hidden border-none shadow-lg">
        {/* Header */}
        <div
          className="p-6"
          style={{ backgroundColor: style.backgroundColor }}
        >
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" style={{ color: style.accentColor }} />
            <h3 style={{ color: style.accentColor }}>
              오늘의 챌린지
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card p-6">
          {/* Challenge Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: style.backgroundColor }}
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: style.accentColor }} />
            </motion.div>
          </div>

          {/* Category */}
          <h4 className="text-center mb-3">
            {challenge.category}
          </h4>

          {/* Challenge Title */}
          <p className="text-center mb-3">
            {challenge.title}
          </p>

          {/* Challenge Description - Beige Box */}
          <div className={`bg-secondary rounded-xl p-4 ${detailView ? '' : 'mb-4'}`}>
            <p className="text-sm text-center">
              {challenge.description}
            </p>
          </div>

          {/* Info Message - only show in analysis result view */}
          {!detailView && (
            <>
              <p className="text-sm text-center mb-6" style={{ color: '#7B8B4F' }}>
                오늘의 챌린지를 달성하면 LP를 획득할 수 있어요!
              </p>

              {/* Action Button */}
              <Button
                onClick={onAcceptChallenge}
                className="w-full text-white"
                style={{ backgroundColor: style.accentColor }}
              >
                도전하기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}