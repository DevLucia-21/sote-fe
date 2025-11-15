import { useState } from 'react';
import { motion } from 'motion/react';
import { EmotionCard } from './EmotionCard';
import { MusicCard } from './MusicCard';
import { ChallengeCard } from './ChallengeCard';
import { AnalysisResult as AnalysisResultType, InstrumentType } from './types';
import { toast } from 'sonner';
import { CharacterType } from '../common/characterImages';

interface AnalysisResultProps {
  result: AnalysisResultType;
  instrument?: InstrumentType;
  onAcceptChallenge?: () => void;
  characterType?: CharacterType;
  onBack?: () => void;
}

export function AnalysisResult({
  result,
  instrument = 'piano',
  onAcceptChallenge,
  characterType = 'PIANO',
  onBack,
}: AnalysisResultProps) {
  
  console.group("🔍 [AnalysisResult Debug]");
  console.log("📌 전달된 result 객체:", result);
  console.log("📌 result.date:", result?.date);
  console.log("📌 result.emotion:", result?.emotion);
  console.log("📌 result.confidence:", result?.confidence);
  console.log("📌 result.reason:", result?.reason);
  console.log("📌 result.description:", result?.description);
  console.log("📌 result.music:", result?.music);
  console.log("📌 result.challenge:", result?.challenge);
  console.groupEnd();

  const [showToast, setShowToast] = useState(true);

  // Show completion toast on mount
  useState(() => {
    if (showToast) {
      toast.success('분석이 완료되었어요 🎧', {
        duration: 3000,
      });
      setShowToast(false);
    }
  });

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-center">
          <h2 className="text-[#4A3228]">
            분석 결과
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Date */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-[#7B8B4F] mb-8"
        >
          {new Date(result.date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })}
        </motion.p>

        {/* Cards */}
        <div className="space-y-6">
          {/* Card 1: Emotion Summary */}
          <EmotionCard
            emotion={result.emotion}
            confidence={result.confidence}
            reason={result.reason}
            description={result.description}
            instrument={instrument}
            characterType={characterType}
          />

          {/* Card 2: Music Recommendation - music가 있을 때만 표시 */}
          {result.music && (
            <MusicCard
              music={result.music}
              emotion={result.emotion}
            />
          )}

          {/* Card 3: Challenge - challenge가 있을 때만 표시 */}
          {result.challenge && (
            <ChallengeCard
              challenge={result.challenge}
              emotion={result.emotion}
              onAcceptChallenge={onAcceptChallenge}
            />
          )}
        </div>

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}