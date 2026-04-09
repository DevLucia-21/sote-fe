import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { InstrumentType, AnalysisStage } from './types';
import { loadingMessages } from './mockData';
import { characterInfo } from '../common/characterImages';
import api from '../../services/api';

interface AnalysisLoadingProps {
  instrument?: InstrumentType;
  onRetry?: () => void;
  onComplete?: (result: any) => void;
  payload: any;
  triggerAnalysis?: boolean;
}

const stages: { stage: AnalysisStage; label: string }[] = [
  { stage: 'text', label: '텍스트 이해 중' },
  { stage: 'emotion', label: '감정 추출 중' },
  { stage: 'music', label: '음악 추천 중' },
];

const STAGE_PROGRESS_POINTS = [34, 68, 92];

const instrumentInfoMap: Record<InstrumentType, { image: string; name: string }> = {
  piano: characterInfo.PIANO,
  guitar: characterInfo.GUITAR,
  marimba: characterInfo.MARIMBA,
  violin: characterInfo.VIOLIN,
  flute: characterInfo.FLUTE,
};

function mapBackendToFrontend(raw: any) {
  return {
    date: raw.analysisDate,
    emotion: raw.emotionLabel,
    confidence: Math.round(raw.emotionScore * 100),
    reason: raw.emotionReason,
    description: raw.emotionReason,
    music: raw.selectedTrackTitle
      ? {
          title: raw.selectedTrackTitle,
          artist: raw.selectedTrackArtist,
          album: raw.selectedTrackAlbum,
          genre: raw.selectedTrackGenre,
          reason: raw.selectedTrackReason,
          coverImageUrl: raw.selectedTrackCoverImageUrl || null,
        }
      : null,
    challenge: raw.challenge || null,
  };
}

function hasAnalysisFields(raw: any) {
  return Boolean(raw?.emotionLabel || raw?.emotionReason || raw?.selectedTrackTitle || raw?.selectedTrackArtist);
}

function getStageIndexForProgress(progress: number) {
  if (progress >= STAGE_PROGRESS_POINTS[1]) {
    return 2;
  }

  if (progress >= STAGE_PROGRESS_POINTS[0]) {
    return 1;
  }

  return 0;
}

function isTodayDate(dateStr?: string) {
  if (!dateStr) return false;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return dateStr === `${year}-${month}-${day}`;
}

export function AnalysisLoading({
  instrument = 'piano',
  onRetry,
  onComplete,
  payload,
  triggerAnalysis = true,
}: AnalysisLoadingProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [userCharacterImage, setUserCharacterImage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [analysisReady, setAnalysisReady] = useState(false);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasRunRef = useRef(false);
  const analysisResultRef = useRef<any>(null);

  useEffect(() => {
    async function fetchCharacter() {
      try {
        const res = await api.get('/api/users/profile');
        const key = res.data.character?.toUpperCase();
        if (key && characterInfo[key]) {
          setUserCharacterImage(characterInfo[key].image);
        }
      } catch (err) {
        console.error('Character API failed:', err);
      }
    }

    void fetchCharacter();
  }, []);

  const instrumentInfo = instrumentInfoMap[instrument];

  useEffect(() => {
    if (analysisReady) {
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= STAGE_PROGRESS_POINTS[2]) {
          return STAGE_PROGRESS_POINTS[2];
        }

        if (prev < STAGE_PROGRESS_POINTS[0]) {
          return Math.min(prev + 3, STAGE_PROGRESS_POINTS[0]);
        }

        if (prev < STAGE_PROGRESS_POINTS[1]) {
          return Math.min(prev + 2, STAGE_PROGRESS_POINTS[1]);
        }

        return Math.min(prev + 1, STAGE_PROGRESS_POINTS[2]);
      });
    }, 150);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [analysisReady]);

  useEffect(() => {
    if (analysisReady) {
      setCurrentStage(2);
      return;
    }

    setCurrentStage(getStageIndexForProgress(progress));
  }, [analysisReady, progress]);

  async function fetchChallenge() {
    if (!isTodayDate(payload?.date)) {
      return null;
    }

    try {
      const statusRes = await api.get('/api/challenge/status');
      return statusRes.data.challenge || statusRes.data;
    } catch (err: any) {
      console.error('Challenge API failed:', err);
      return null;
    }
  }

  useEffect(() => {
    if (!payload?.diaryId || hasRunRef.current) return;
    hasRunRef.current = true;

    let isCancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function storeAnalysisResult(raw: any) {
      const challenge = await fetchChallenge();
      analysisResultRef.current = mapBackendToFrontend({
        ...raw,
        challenge,
      });
      setCurrentStage(2);
      setProgress(100);
      setAnalysisReady(true);
    }

    async function fetchAnalysisResult() {
      const res = await api.get(`/api/analysis/${payload.diaryId}`);
      await storeAnalysisResult(res.data);
    }

    async function waitForAnalysisCompletion() {
      try {
        await fetchAnalysisResult();
      } catch (err: any) {
        const status = err.response?.status;

        if ((status === 404 || status === 409) && !isCancelled) {
          retryTimer = setTimeout(() => {
            void waitForAnalysisCompletion();
          }, 1500);
          return;
        }

        console.error('Analysis status polling failed:', err);
        setIsError(true);
      }
    }

    async function runAnalysis() {
      try {
        if (triggerAnalysis) {
          const res = await api.post('/api/analysis', payload);
          if (hasAnalysisFields(res.data)) {
            await storeAnalysisResult(res.data);
            return;
          }
        }

        await waitForAnalysisCompletion();
      } catch (err: any) {
        const status = err.response?.status;

        if (status === 403 || status === 409) {
          await waitForAnalysisCompletion();
          return;
        }

        console.error('Analysis request failed:', err);
        setIsError(true);
      }
    }

    void runAnalysis();

    return () => {
      isCancelled = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [payload, triggerAnalysis]);

  useEffect(() => {
    if (progress === 100 && analysisReady && analysisResultRef.current) {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
      }

      completionTimerRef.current = setTimeout(() => {
        onComplete?.(analysisResultRef.current);
      }, 250);
    }
    return () => {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
        completionTimerRef.current = null;
      }
    };
  }, [analysisReady, progress, onComplete]);

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p>분석 중 오류가 발생했어요.</p>
        <Button onClick={onRetry}>다시 시도하기</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <p className="text-[#7B8B4F] mb-2">AI가 당신의 하루를 해석하는 중이에요.</p>
          <h1 className="text-[#4A3228]">감성분석 중...</h1>
        </div>

        <div className="flex justify-center mb-12">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="w-40 h-40 rounded-full bg-white shadow-lg flex items-center justify-center relative overflow-hidden">
              {userCharacterImage ? (
                <img src={userCharacterImage} alt="캐릭터" className="w-28 h-28 object-contain z-10" />
              ) : (
                <img src={instrumentInfo.image} alt={instrumentInfo.name} className="w-20 h-20 text-[#7B8B4F] z-10" />
              )}

              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full border-4 border-[#7B8B4F]"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute inset-0 rounded-full border-4 border-[#7B8B4F]"
              />
            </div>
          </motion.div>
        </div>

        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center text-[#4A3228] mb-8 min-h-[3rem] flex items-center justify-center"
        >
          {loadingMessages[messageIndex]}
        </motion.p>

        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-[#7B8B4F] mt-2">{progress}%</p>
        </div>

        <div className="space-y-3">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: index <= currentStage ? 1 : 0.3 }}
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
              <span className={index <= currentStage ? 'text-[#4A3228]' : 'text-[#999999]'}>
                {stage.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
