import React, { useState, useEffect } from 'react';
import api from '../../services/api'
import { motion } from 'motion/react';
import { ArrowLeft, FileText, Mic, Pencil, Image, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { DiaryEntry } from './types';
import { emotionColors, getEmotionLabel } from './noteMapping';
import { EmotionCard } from '../analysis/EmotionCard';
import { MusicCard } from '../analysis/MusicCard';
import { ChallengeCard } from '../analysis/ChallengeCard';
import { AnalysisResult as AnalysisResultType } from '../analysis/types';
import { CharacterType } from '../common/characterImages';
import { markDeletedDiaryAnalysisWarning } from '../../utils/deletedDiaryAnalysisWarning';
import { hasRewrittenDiaryStatus } from '../../utils/rewrittenDiaryStatus';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "../ui/dialog";

interface DiaryDetailViewProps {
  diary: DiaryEntry;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: (date: string) => void;
  isEasyMode?: boolean;
  characterType?: CharacterType;
}

export function DiaryDetailView({ diary, onBack, onEdit, onDelete, isEasyMode, characterType }: DiaryDetailViewProps) {
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
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getErrorStatus = (error: unknown) => {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error
    ) {
      return (error as { response?: { status?: number } }).response?.status;
    }

    return undefined;
  };

  const hasAnalysisFields = (raw: any) => {
    return Boolean(raw?.emotionLabel || raw?.emotionReason || raw?.selectedTrackTitle || raw?.selectedTrackArtist);
  };

  const isAnalysisPendingResponse = (raw: any) => {
    if (raw == null) {
      return true;
    }

    if (typeof raw === 'string') {
      return raw.trim().length === 0;
    }

    if (Array.isArray(raw)) {
      return raw.length === 0;
    }

    if (typeof raw === 'object') {
      return Object.keys(raw).length === 0 || !hasAnalysisFields(raw);
    }

    return false;
  };

  const fetchDiaryByDate = async (dateStr: string) => {
    const findDiaryForDate = (data: any) => {
      if (Array.isArray(data)) {
        return data.find((item) => {
          const itemDate = (item.date || item.diaryDate || '').split("T")[0];
          return itemDate === dateStr;
        });
      }

      return data;
    };

    try {
      const rangeRes = await api.get("/api/diaries", {
        params: { from: dateStr, to: dateStr }
      });

      const diaryForDate = findDiaryForDate(rangeRes.data);
      if (diaryForDate) {
        return diaryForDate;
      }
    } catch (error) {
      const status = getErrorStatus(error);

      if (status !== 403 && status !== 404) {
        throw error;
      }
    }

    const res = await api.get(`/api/diaries?date=${dateStr}`);
    return res.data;
  };

  const createFallbackAnalysisData = (diaryData: any): AnalysisResultType => {
    if (hasRewrittenDiaryStatus(diaryData.date) || diaryData.analysisDisabled) {
      return {
        id: `rewritten-${diaryData.id ?? diaryData.date}`,
        date: diaryData.date,
        emotion: "기쁨",
        confidence: 0,
        reason: "재작성으로 분석 결과가 없습니다.",
        description: "재작성한 일기는 저장만 되고 감정 분석, 음악 추천, 챌린지 추천은 표시되지 않아요.",
      } as AnalysisResultType;
    }

    const emotionMap: Record<string, any> = {
      JOY: "기쁨",
      SADNESS: "슬픔",
      ANGER: "분노",
      APATHY: "무기력",
      SENSITIVE: "예민",
      "기쁨": "기쁨",
      "슬픔": "슬픔",
      "분노": "분노",
      "화남": "화남",
      "무기력": "무기력",
      "예민": "예민",
    };

    const emotion = emotionMap[diaryData.emotion] || emotionMap[diaryData.emotionLabel] || "기쁨";
    const score = Number(diaryData.score ?? diaryData.emotionScore ?? 3);
    const confidence = score <= 5 ? Math.round((score / 5) * 100) : Math.round(score * 100);

    return {
      id: `fallback-${diaryData.id}`,
      date: diaryData.date,
      emotion,
      confidence: Math.min(Math.max(confidence, 0), 100),
      reason: "분석 결과를 아직 불러오지 못했어요.",
      description: "일기 내용은 저장되어 있어요. 분석 결과가 준비되면 다시 표시됩니다.",
    } as AnalysisResultType;
  };

  async function fetchChallenge() {
    try {
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
          return res.data;
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

        const diaryData = diary.id && diary.content ? diary : await fetchDiaryByDate(diary.date);
        if (!diaryData?.id) {
          throw new Error(`일기 상세를 찾을 수 없습니다: ${diary.date}`);
        }

        setDiaryData(diaryData);
        console.log("일기 상세", diaryData)

        const isRewrittenDiary = hasRewrittenDiaryStatus(diaryData.date) || diaryData.analysisDisabled;

        if (isRewrittenDiary) {
          setAnalysisData(createFallbackAnalysisData(diaryData));
          return;
        }

        const fetchAnalysisWithRetry = async (diaryId: number, retries = 6, delayMs = 1500) => {
          for (let attempt = 0; attempt <= retries; attempt += 1) {
            try {
              const res = await api.get(`/api/analysis/${diaryId}`);

              if (isAnalysisPendingResponse(res.data)) {
                throw Object.assign(new Error("Analysis result is empty"), {
                  response: { status: 409 },
                });
              }

              return res.data;
            } catch (error) {
              const status = getErrorStatus(error);
              const isRetryable = status === 404 || status === 409;

              if (!isRetryable || attempt === retries) {
                throw error;
              }

              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
          }

          return null;
        };

        let raw;
        try {
          raw = await fetchAnalysisWithRetry(diaryData.id);
        } catch (error) {
          if (getErrorStatus(error) === 404 || getErrorStatus(error) === 409) {
            console.warn("분석 결과가 아직 없어 기본 정보로 상세를 표시합니다:", diaryData.id);
            setAnalysisData(createFallbackAnalysisData(diaryData));
            return;
          }

          throw error;
        }

        console.log("🔥🔥 [Analysis Raw Response]", JSON.stringify(raw, null, 2));

        let coverUrl = raw.selectedTrackCoverImageUrl;

        if (!coverUrl) {
          try {
            const rewardDate = new Date(diaryData.date);
            const lpRes = await api.get("/api/lp/monthly", {
              params: { year: rewardDate.getFullYear(), month: rewardDate.getMonth() + 1 }
            });
            const diaryDateKey = (diaryData.date || '').split("T")[0];
            const reward = lpRes.data.find(
              (item: any) => (item.rewardDate || '').split("T")[0] === diaryDateKey
            );

            if (reward?.albumImageUrl || reward?.imageUrl) {
              coverUrl = reward.albumImageUrl || reward.imageUrl;
              console.log("🎉 LP 목록에서 이미지 보정됨:", coverUrl);
            }
          } catch (e) {
            console.log("⚠ LP 목록 조회 실패:", e);
          }
        }

        const musicData = {
          title: raw.selectedTrackTitle,
          artist: raw.selectedTrackArtist,
          genre: raw.selectedTrackGenre,
          reason: raw.selectedTrackReason,
          album: raw.selectedTrackAlbum,
          coverImageUrl: coverUrl,
        };

        const challenge = await fetchChallenge();
        const mappedChallenge = challenge
          ? {
              title: challenge.category,
              content: challenge.content,
              emotion: challenge.emotionType,
              difficulty: challenge.category || "easy",
              duration: "5분",
              icon: "✨",
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

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete("/api/diaries", { params: { date: diary.date } });
      markDeletedDiaryAnalysisWarning(diary.date);
      setDeleteOpen(false);
      onDelete?.(diary.date);
      onBack?.();
    } catch (err) {
      console.error("❌ 일기 삭제 실패:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || !diaryData || !analysisData) {
    return <div className="flex justify-center items-center min-h-screen py-20">로딩 중...</div>;
  }

  const detailDiary = diaryData;
  const color = emotionColors[analysisData.emotion] || '#7B8B4F';
  const isRewrittenDiary = hasRewrittenDiaryStatus(detailDiary.date) || !!detailDiary.analysisDisabled;
  
  const getWriteTypeIcon = () => {
    switch (detailDiary.writeType) {
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
    switch (detailDiary.writeType) {
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
      <div className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center">
          <Button variant="ghost" onClick={onBack} className="text-foreground -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="flex-1 text-center text-foreground">
            일기 상세
          </h2>
          <Button 
            variant="ghost"
            onClick={() => setDeleteOpen(true)}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-8 h-8" style={{ transform: "scale(1.4)", transformOrigin: "center" }} />
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <p className="text-primary">
            {new Date(detailDiary.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden border-border shadow-lg p-6 bg-card">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-foreground">
                  {new Date(detailDiary.date).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                  })} 일기
                </h3>

                {detailDiary.imageUrl && (
                  <button
                    onClick={() => setIsImageOpen(true)}
                    className="ml-auto mr-2 flex items-center justify-center"
                  >
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs text-foreground">
                      <Image className="w-4 h-4" />
                      <span>이미지 보기</span>
                    </div>
                  </button>
                )}

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs text-foreground">
                  {getWriteTypeIcon()}
                  <span>{getWriteTypeLabel()}</span>
                </div>
              </div>
              
              {!isEasyMode && detailDiary.keywords && detailDiary.keywords.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm mb-2 text-primary">키워드</p>
                  <div className="flex flex-wrap gap-2">
                    {detailDiary.keywords.map((keyword, index) => (
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

              {detailDiary.content && (
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
                        수정
                      </Button>
                    )}
                  </div>
                  <div className="p-4 rounded-xl leading-relaxed text-sm bg-secondary text-foreground">
                    {detailDiary.content}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {!isRewrittenDiary && (
            <EmotionCard
              emotion={analysisData.emotion}
              confidence={analysisData.confidence}
              reason={analysisData.reason}
              description={analysisData.description}
              instrument="piano"
              characterType={userCharacter}
            />
          )}

          {!isEasyMode && !isRewrittenDiary && analysisData.music && (
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

          {!isEasyMode &&
            !isRewrittenDiary &&
            analysisData.challenge &&
            isToday(detailDiary.date) && (
            <ChallengeCard
              challenge={analysisData.challenge}
              emotion={analysisData.emotion}
              detailView={true}
            />
          )}
        </div>
      </div>

      {isImageOpen && detailDiary.imageUrl && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsImageOpen(false)}
        >
          <img
            src={detailDiary.imageUrl}
            alt="full"
            className="rounded-lg shadow-lg object-contain w-[280px] h-auto"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">일기를 삭제할까요?</DialogTitle>
            <DialogDescription className="text-center">
              삭제 후에도 일기는 다시 작성할 수 있지만,
              <br />
              재작성한 일기는 감정 분석이 불가능해요.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteOpen(false)}
            >
              취소
            </Button>

            <Button 
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
