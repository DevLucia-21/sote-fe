import React, { useState, useEffect } from 'react';
import api from '../../services/api'
import { motion } from 'motion/react';
import { ArrowLeft, FileText, Mic, Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { DiaryEntry } from './types';
import { emotionColors, getEmotionLabel } from './noteMapping';
import { EmotionCard } from '../analysis/EmotionCard';
import { MusicCard } from '../analysis/MusicCard';
import { ChallengeCard } from '../analysis/ChallengeCard';
import { AnalysisResult as AnalysisResultType } from '../analysis/types';
import { CharacterType } from '../common/characterImages';

interface DiaryDetailViewProps {
  diary: DiaryEntry;
  onBack: () => void;
  onEdit?: () => void;
  isEasyMode?: boolean;
  characterType?: CharacterType;
}

export function DiaryDetailView({ diary, onBack, onEdit, isEasyMode, characterType }: DiaryDetailViewProps) {
  const [diaryData, setDiaryData] = useState<DiaryEntry | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResultType | null>(null);
  const [loading, setLoading] = useState(true);
  const characterToInstrument: Record<string, string> = {
    "PIANO": "piano",
    "VIOLIN": "violin",
    "GUITAR": "guitar",
    "FLUTE": "flute",
    "MARIMBA": "marimba",
  };
  const [userCharacter, setUserCharacter] = useState("PIANO");

  async function fetchChallenge() {
    try {
      // 오늘 이미 추천되었으면 여기서 받아짐
      const res = await api.get("/api/challenge/status");
      return res.data.challenge || res.data;
    } catch (err) {
      console.error("❌ 챌린지 로드 실패:", err);
      return null;
    }
  }
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const fetchUserProfile = async () => {
          const res = await api.get("/api/users/profile");
          return res.data; // { character: "MARIMBA", ... }
        };

        const loadProfile = async () => {
          try {
            const profile = await fetchUserProfile();
            setUserCharacter(profile.character?.toUpperCase() || "PIANO");
          } catch (e) {
            console.error("프로필 불러오기 실패:", e);
          }
        };
        loadProfile();

        // 1) 일기 상세
        const diaryRes = await api.get(`/api/diaries?date=${diary.date}`);
        setDiaryData(diaryRes.data);

        // 2) 분석 데이터 가져오기
        const analysisRes = await api.get(`/api/analysis/${diaryRes.data.id}`);
        const raw = analysisRes.data;
        console.log("🔥🔥 [Analysis Raw Response]", JSON.stringify(raw, null, 2));

        let coverUrl = raw.selectedTrackCoverImageUrl;

        // LP 목록에서 보정하기
        if (!coverUrl) {
          try {
            const lpRes = await api.get("/api/lp/list");  // 🔥 허용된 API
            const reward = lpRes.data.find(
              (item: any) => item.rewardDate === diary.date
            );

            if (reward?.albumImageUrl) {
              coverUrl = reward.albumImageUrl;
              console.log("🎉 LP 목록에서 이미지 보정됨:", coverUrl);
            }
          } catch (e) {
            console.log("⚠ LP 목록 조회 실패:", e);
          }
        }

        // 🔥 3) MusicCard 데이터 구성
        const musicData = {
          title: raw.selectedTrackTitle,
          artist: raw.selectedTrackArtist,
          genre: raw.selectedTrackGenre,
          reason: raw.selectedTrackReason,
          album: raw.selectedTrackAlbum,
          coverImageUrl: coverUrl, // ✨ 최종 보정된 URL
        };

        const challenge = await fetchChallenge();
        const mappedChallenge = challenge
          ? {
              title: challenge.category,
              content: challenge.content,
              emotion: challenge.emotionType,
              difficulty: challenge.category || "easy", // 백엔드에 난이도 없음 → category 사용 또는 기본값
              duration: "5분",  // 백엔드에 duration 없음 → 기본값
              icon: "✨",        // 백엔드에 아이콘 없음 → 기본값
            }
          : null;

        const mappedAnalysisData: AnalysisResultType = {
          emotion: raw.emotionLabel,
          confidence: Math.round(raw.emotionScore * 100),
          reason: raw.emotionReason,
          description: `${raw.emotionLabel}의 감정이 느껴지는 하루였어요.`,
          music: musicData,
          challenge: mappedChallenge,
        };

        setAnalysisData(mappedAnalysisData);

      } catch (err) {
        console.error("❌ DiaryDetailView fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [diary.date]);

  if (loading || !diaryData || !analysisData) {
    return <div className="flex justify-center items-center min-h-screen py-20">로딩 중...</div>;
  }
  const color = emotionColors[analysisData.emotion];
  
  const getWriteTypeIcon = () => {
    switch (diary.writeType) {
      case 'TEXT':
        return <FileText className="w-4 h-4" />;
      case 'VOICE':
        return <Mic className="w-4 h-4" />;
      case 'HANDWRITING':
        return <Pencil className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getWriteTypeLabel = () => {
    switch (diary.writeType) {
      case 'TEXT':
        return '텍스트';
      case 'STT':
        return '음성';
      case 'OCR':
        return '손글씨';
      default:
        return '텍스트';
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(diary);
    }
  };

  const isToday = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();

    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };
  
  return (
    <div className="fixed inset-x-0 top-0 bottom-0 bg-background z-40 overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center">
          <Button variant="ghost" onClick={onBack} className="text-foreground -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="flex-1 text-center text-foreground">
            일기 상세
          </h2>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Date */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <p className="text-primary">
            {new Date(diary.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Card 1: Diary Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden border-border shadow-lg p-6 bg-card">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-foreground">
                  {new Date(diary.date).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                  })} 일기
                </h3>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs text-foreground">
                  {getWriteTypeIcon()}
                  <span>{getWriteTypeLabel()}</span>
                </div>
              </div>
              
              {/* Keywords - 이지모드에서 제거 */}
              {!isEasyMode && diary.keywords && diary.keywords.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm mb-2 text-primary">키워드</p>
                  <div className="flex flex-wrap gap-2">
                    {diary.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: color + '15',
                          color: color,
                        }}
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diary Content */}
              {diary.content && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-primary">작성 내용</p>
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEdit}
                        className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        재작성
                      </Button>
                    )}
                  </div>
                  <div className="p-4 rounded-xl leading-relaxed text-sm bg-secondary text-foreground">
                    {diary.content}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Card 2: Emotion Summary */}
          <EmotionCard
            emotion={analysisData.emotion}
            confidence={analysisData.confidence}
            reason={analysisData.reason}
            description={analysisData.description}
            instrument="piano"
            characterType={userCharacter}
          />

          {/* Card 3: Music Recommendation - 이지모드에서 제거 */}
          {!isEasyMode && analysisData.music && (
            <MusicCard
              title={analysisData.music.title}
              artist={analysisData.music.artist}
              album={analysisData.music.album}
              genre={analysisData.music.genre}
              coverImageUrl={analysisData.music.coverImageUrl}
              reason={analysisData.music.reason}
              emotion={analysisData.emotion}
            />
          )}

          {/* Card 4: Challenge - 당일 작성한 일기만 표시, 이지모드에서 제거 */}
          {!isEasyMode &&
            analysisData.challenge &&
            isToday(diary.date) && (
            <ChallengeCard
              challenge={analysisData.challenge}
              emotion={analysisData.emotion}
              detailView={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}