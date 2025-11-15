import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { InstrumentType, AnalysisStage } from './types';
import { loadingMessages } from './mockData';
import { characterInfo } from '../common/characterImages';
import api from "../../services/api";

interface AnalysisLoadingProps {
  instrument?: InstrumentType;
  onRetry?: () => void;
  onComplete?: (result: any) => void;   // ★ 분석 결과 전달
  payload: any;                         // ★ 분석 요청 payload
}

const stages: { stage: AnalysisStage; label: string }[] = [
  { stage: 'text', label: '텍스트 이해 중' },
  { stage: 'emotion', label: '감정 추출 중' },
  { stage: 'music', label: '음악 추천 중' },
];

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
    description: raw.emotionReason,  // 동일 값 사용
    music: raw.selectedTrackTitle
      ? {
          genre: raw.selectedTrackGenre,
          title: raw.selectedTrackTitle,
          artist: raw.selectedTrackArtist,
          album: raw.selectedTrackAlbum,
          range: raw.selectedTrackRange,
        }
      : null,
    challenge: raw.challenge || null,
  };
}

export function AnalysisLoading({ 
  instrument = 'piano', 
  onRetry,
  onComplete,
  payload
}: AnalysisLoadingProps) {

  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [userCharacterImage, setUserCharacterImage] = useState<string | null>(null);

  const [isError, setIsError] = useState(false);  // ★ 빠져있던 코드 복구

  const hasRunRef = useRef(false);
  const analysisResultRef = useRef<any>(null);

  useEffect(() => {
    async function fetchCharacter() {
      try {
        const res = await api.get("/api/users/profile");
        const key = res.data.character?.toUpperCase();
        if (key && characterInfo[key]) {
          setUserCharacterImage(characterInfo[key].image);
        }
      } catch (err) {
        console.error("캐릭터 API 실패:", err);
      }
    }
    fetchCharacter();
  }, []);

  const instrumentInfo = instrumentInfoMap[instrument];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 100));
    }, 150);

    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => Math.min(prev + 1, 2));
    }, 5000);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      clearInterval(messageInterval);
    };
  }, []);

  async function fetchChallenge() {
    try {
      const res = await api.get("/api/challenge/today");
      return res.data;
    } catch (err: any) {
      if (err.response?.data?.message?.includes("이미 추천")) {
        const res2 = await api.get("/api/challenge/status");
        return res2.data.challenge || res2.data;
      }
      return null;
    }
  }

  useEffect(() => {
    console.log("🟢 [DEBUG] AnalysisLoading 시작");
    console.log("📦 들어온 payload:", payload);
  }, [payload]);

  /** ---------------------------
   *  1) 서버 분석 요청
   ---------------------------- */
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    async function runAnalysis() {
      console.log("🔵 [DEBUG] 분석 시작");
      console.log("🔵 [DEBUG] payload:", payload);

      try {
        const res = await api.post("/api/analysis", payload);
        const challenge = await fetchChallenge();
        analysisResultRef.current = mapBackendToFrontend({
          ...res.data,
          challenge,
        });

        console.log("🟢 [DEBUG] POST 성공");
        console.log("🟢 [DEBUG] 전체 응답:", res);
        console.log("🟢 [DEBUG] 응답 데이터:", res.data);

        if (progress >= 100) {
          console.log("🟢 [DEBUG] progress 100 → onComplete 호출");
          onComplete?.(analysisResultRef.current);
        }
      } catch (err: any) {
        console.error("🔴 [DEBUG] POST 에러:", err);

        if (err.response?.status === 409) {
          console.warn("🟡 [DEBUG] 409 발생 → 기존 분석 결과 GET 요청");

          try {
            const res2 = await api.get(`/api/analysis/${payload.diaryId}`);
            const challenge = await fetchChallenge();
            analysisResultRef.current = mapBackendToFrontend({
              ...res2.data,
              challenge,
            });

            console.log("🟡 [DEBUG] GET 성공");
            console.log("🟡 [DEBUG] GET 전체 응답:", res2);
            console.log("🟡 [DEBUG] GET 데이터:", res2.data);

            if (progress >= 100) {
              console.log("🟡 [DEBUG] progress 100 → onComplete 호출");
              onComplete?.(analysisResultRef.current);
            }
          } catch (getErr) {
            console.error("🔴 [DEBUG] GET 분석 결과 실패:", getErr);
            setIsError(true);
          }
        } else {
          console.error("🔴 [DEBUG] 분석 실패 (409 아님):", err);
          setIsError(true);
        }
      }
    }

    if (payload?.diaryId) {
      runAnalysis();
    }
  }, [payload, progress, onComplete]);


  /** ---------------------------
   * 2) progress 증가 (0 → 100)
   ---------------------------- */
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => Math.min(p + 2, 100));
    }, 150);
    return () => clearInterval(timer);
  }, []);


  /** ---------------------------
   * 3) Stage 진행도 업데이트
   ---------------------------- */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage(s => Math.min(s + 1, 2));
    }, 5000);
    return () => clearInterval(timer);
  }, []);


  /** ---------------------------
   * 4) 메시지 변경
   ---------------------------- */
  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex(i => (i + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);


  /** ---------------------------
   * 5) 서버 결과 + progress 100 둘 다 되면 완료
   ---------------------------- */
  useEffect(() => {
    if (progress === 100 && analysisResultRef.current) {
      onComplete?.(analysisResultRef.current);
    }
  }, [progress, onComplete]);


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
              {userCharacterImage ? (
                <img 
                  src={userCharacterImage}
                  alt="캐릭터" 
                  className="w-28 h-28 object-contain z-10"
                />
              ) : (
                <img src={instrumentInfo.image}  className="w-20 h-20 text-[#7B8B4F] z-10" />
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