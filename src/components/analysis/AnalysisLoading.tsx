import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Music, Guitar, Piano, Mic2 } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { InstrumentType, AnalysisStage } from './types';
import { loadingMessages } from './mockData';
import { characterInfo } from '../common/characterImages';

interface AnalysisLoadingProps {
  instrument?: InstrumentType;
  onRetry?: () => void;
  onComplete?: () => void;
}

const stages: { stage: AnalysisStage; label: string }[] = [
  { stage: 'text', label: '텍스트 이해 중' },
  { stage: 'emotion', label: '감정 추출 중' },
  { stage: 'music', label: '음악 추천 중' },
];

const instrumentIcons: Record<InstrumentType, typeof Music> = {
  guitar: Guitar,
  piano: Piano,
  drum: Music,
  violin: Music,
  saxophone: Mic2,
};

export function AnalysisLoading({ 
  instrument = 'piano', 
  onRetry,
  onComplete 
}: AnalysisLoadingProps) {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);

  // 사용자 악기 이미지 가져오기
  const [userInstrumentImage, setUserInstrumentImage] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('profileData');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        const characterKey = profile.character as keyof typeof characterInfo;
        if (characterKey && characterInfo[characterKey]?.image) {
          setUserInstrumentImage(characterInfo[characterKey].image);
        }
      }
    } catch (e) {
      console.error('Failed to load user instrument image:', e);
    }
  }, []);

  const InstrumentIcon = instrumentIcons[instrument];

  useEffect(() => {
    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          if (onComplete) {
            setTimeout(() => onComplete(), 500);
          }
          return 100;
        }
        return prev + 2;
      });
    }, 150);

    // Update stages
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < 2) return prev + 1;
        return prev;
      });
    }, 5000);

    // Rotate messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    // Simulate timeout after 30 seconds
    const timeoutTimer = setTimeout(() => {
      setIsTimeout(true);
    }, 30000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      clearInterval(messageInterval);
      clearTimeout(timeoutTimer);
    };
  }, [onComplete]);

  if (isTimeout || isError) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#5D3F35] flex items-center justify-center"
          >
            <InstrumentIcon className="w-10 h-10 text-white" />
          </motion.div>
          
          <p className="text-[#4A3228] mb-8">
            분석이 예상보다 오래 걸리고 있어요.
          </p>

          <Button
            onClick={onRetry}
            className="bg-[#7B8B4F] hover:bg-[#6a7a45] text-white"
          >
            다시 시도하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#7B8B4F] mb-2">
            AI가 당신의 하루를 해석하는 중이에요.
          </p>
          <h1 className="text-[#4A3228]">
            감성분석 중…
          </h1>
        </div>

        {/* Animated Character */}
        <div className="flex justify-center mb-12">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
          >
            {/* Character Circle */}
            <div className="w-40 h-40 rounded-full bg-white shadow-lg flex items-center justify-center relative overflow-hidden">
              {userInstrumentImage ? (
                <img 
                  src={userInstrumentImage} 
                  alt="악기" 
                  className="w-28 h-28 object-contain z-10"
                />
              ) : (
                <InstrumentIcon className="w-20 h-20 text-[#7B8B4F] z-10" />
              )}
              
              {/* Animated Waves */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full border-4 border-[#7B8B4F]"
              />
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute inset-0 rounded-full border-4 border-[#7B8B4F]"
              />
            </div>
          </motion.div>
        </div>

        {/* Loading Message */}
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center text-[#4A3228] mb-8 min-h-[3rem] flex items-center justify-center"
        >
          {loadingMessages[messageIndex]}
        </motion.p>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-[#7B8B4F] mt-2">
            {progress}%
          </p>
        </div>

        {/* Stage Indicators */}
        <div className="space-y-3">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: index <= currentStage ? 1 : 0.3,
              }}
              className="flex items-center gap-3"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  index < currentStage
                    ? 'bg-[#7B8B4F]'
                    : index === currentStage
                    ? 'bg-[#7B8B4F] animate-pulse'
                    : 'bg-[#E5E5E5]'
                }`}
              >
                {index < currentStage && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
              </div>
              <span className={`${index <= currentStage ? 'text-[#4A3228]' : 'text-[#999999]'}`}>
                {stage.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}