import { useEffect, useState } from 'react';
import api from '../../services/api';
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

export function hasValidAnalysis(data: any) {
  if (!data) return false;

  return Boolean(
    data.emotionLabel ||
    data.emotionReason ||
    data.selectedTrackTitle ||
    data.selectedTrackArtist ||
    data.emotion ||
    data.reason ||
    data.description ||
    data.music?.title ||
    data.music?.artist
  );
}

export function normalizeAnalysisResult(data: any): AnalysisResultType | null {
  if (!hasValidAnalysis(data)) return null;

  const rawScore = Number(data.emotionScore);
  const confidenceFromScore = Number.isFinite(rawScore)
    ? Math.min(Math.max(Math.round(rawScore * 100), 0), 100)
    : null;

  return {
    ...data,
    date: data.date ?? data.analysisDate ?? '',
    emotion: data.emotion ?? data.emotionLabel ?? '기쁨',
    confidence: data.confidence ?? confidenceFromScore ?? 0,
    reason: data.reason ?? data.description ?? data.emotionReason ?? '',
    description: data.description ?? data.reason ?? data.emotionReason ?? '',
    music: data.music ?? (
      data.selectedTrackTitle
        ? {
            title: data.selectedTrackTitle,
            artist: data.selectedTrackArtist,
            album: data.selectedTrackAlbum,
            genre: data.selectedTrackGenre,
            reason: data.selectedTrackReason,
            coverImageUrl: data.selectedTrackCoverImageUrl,
          }
        : null
    ),
    challenge: data.challenge ?? null,
  } as AnalysisResultType;
}

export function AnalysisResult({
  result,
  onAcceptChallenge,
}: AnalysisResultProps) {
  const normalizedResult = normalizeAnalysisResult(result);
  const [instrument, setInstrument] = useState<InstrumentType>('piano');
  const [characterType, setCharacterType] = useState<CharacterType>('PIANO');
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/api/users/profile');
        const char = res.data.character || 'PIANO';

        setCharacterType(char.toUpperCase() as CharacterType);
        setInstrument(char.toLowerCase() as InstrumentType);
      } catch (err) {
        console.error('프로필을 불러오지 못했습니다:', err);
      }
    };

    loadProfile();
  }, []);

  useState(() => {
    if (showToast) {
      toast.success('분석이 완료되었어요', {
        duration: 3000,
      });
      setShowToast(false);
    }
  });

  if (!normalizedResult) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-[#4A3228]">분석 결과가 없습니다.</p>
          <p className="text-sm text-[#7B8B4F] mt-2">일기 내용은 정상적으로 저장되어 있어요.</p>
        </div>
      </div>
    );
  }

  const resultDate = normalizedResult.date ? new Date(normalizedResult.date) : null;
  const formattedDate = resultDate && !Number.isNaN(resultDate.getTime())
    ? resultDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      })
    : normalizedResult.date;

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-center">
          <h2 className="text-[#4A3228]">
            분석 결과
          </h2>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-[#7B8B4F] mb-8"
        >
          {formattedDate}
        </motion.p>

        <div className="space-y-6">
          <EmotionCard
            emotion={normalizedResult.emotion}
            confidence={normalizedResult.confidence}
            reason={normalizedResult.reason}
            description={normalizedResult.description}
            instrument={instrument}
            characterType={characterType}
          />

          {normalizedResult.music && (
            <MusicCard
              title={normalizedResult.music.title}
              artist={normalizedResult.music.artist}
              album={normalizedResult.music.album}
              genre={normalizedResult.music.genre}
              coverImageUrl={normalizedResult.music.coverImageUrl}
              reason={normalizedResult.music.reason}
              emotion={normalizedResult.emotion}
            />
          )}

          {normalizedResult.challenge && (
            <ChallengeCard
              challenge={normalizedResult.challenge}
              emotion={normalizedResult.emotion}
              onAcceptChallenge={onAcceptChallenge}
            />
          )}
        </div>

        <div className="h-12" />
      </div>
    </div>
  );
}
