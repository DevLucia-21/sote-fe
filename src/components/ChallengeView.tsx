import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { BadgeGallery, EmotionChip, MonthlyChallengeView } from './challenge';
import { LPRewardView } from './LPRewardView';
import {
  Trophy,
  Target,
  Music,
  ArrowLeft,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchChallengeStatus } from './challenge/challengeApi';

type ViewMode = 'main' | 'badges' | 'lp-reward' | 'monthly-challenge';

type RewardMusic = {
  title: string;
  artist: string;
  albumImageUrl: string;
  reason: string;
  playUrl?: string;
} | null;

const CHALLENGE_PROGRESS_STORAGE_KEY = 'challenge-progress';

function getTodayDateKey() {
  return new Date().toISOString().split('T')[0];
}

function getProgressStorageKey(challengeId: number | string) {
  return `${CHALLENGE_PROGRESS_STORAGE_KEY}:${getTodayDateKey()}:${challengeId}`;
}

function readStoredProgress(challengeId: number | string) {
  const raw = localStorage.getItem(getProgressStorageKey(challengeId));
  if (!raw) return null;

  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return null;

  return Math.max(0, Math.min(100, parsed));
}

export function ChallengeView() {
  const [currentView, setCurrentView] = useState<ViewMode>('main');
  const [progress, setProgress] = useState(0);
  const [todayChallenge, setTodayChallenge] = useState<any>(null);
  const [isPersistedChallenge, setIsPersistedChallenge] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [musicData, setMusicData] = useState<RewardMusic>(null);

  const applyRewardData = (reward: any) => {
    if (!reward) {
      return false;
    }

    setMusicData({
      title: reward.title,
      artist: reward.artist,
      albumImageUrl: reward.albumImageUrl,
      reason: '오늘의 챌린지를 달성했어요.',
      playUrl: reward.playUrl,
    });

    return true;
  };

  const fetchTodayReward = async () => {
    try {
      const res = await api.get('/api/lp/today');
      return res.data;
    } catch (error) {
      console.error('오늘의 LP 보상 조회 실패:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchTodayChallenge = async () => {
      try {
        const status = await fetchChallengeStatus();

        if (status.challengeId) {
          setTodayChallenge(status);
          setIsPersistedChallenge(true);

          if (status.completed) {
            setProgress(100);
            setIsCompleted(true);
            applyRewardData(status.reward);
          } else {
            const savedProgress = readStoredProgress(status.challengeId);
            setProgress(savedProgress ?? 0);
          }
        } else {
          setTodayChallenge(null);
          setIsPersistedChallenge(false);
          setProgress(0);
        }
      } catch (error) {
        console.error('오늘의 챌린지 조회 실패:', error);
        toast.error('오늘의 챌린지를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    };

    void fetchTodayChallenge();
  }, []);

  useEffect(() => {
    if (!todayChallenge?.challengeId || isCompleted || !isPersistedChallenge) return;

    localStorage.setItem(
      getProgressStorageKey(todayChallenge.challengeId),
      String(progress),
    );
  }, [todayChallenge?.challengeId, progress, isCompleted, isPersistedChallenge]);

  const openRewardView = async (reward?: any) => {
    const resolvedReward = reward ?? await fetchTodayReward();

    if (!applyRewardData(resolvedReward)) {
      toast.error('LP 보상 정보를 아직 불러오지 못했어요. 잠시 후 다시 확인해주세요.');
      return false;
    }

    setCurrentView('lp-reward');
    return true;
  };

  const syncCompletedState = async () => {
    const refreshedStatus = await fetchChallengeStatus();

    setTodayChallenge((prev: any) => ({
      ...prev,
      ...refreshedStatus,
    }));
    setProgress(100);
    setIsCompleted(true);

    if (todayChallenge?.challengeId) {
      localStorage.setItem(getProgressStorageKey(todayChallenge.challengeId), '100');
    }

    return refreshedStatus;
  };

  const handleCompleteChallenge = async () => {
    if (!todayChallenge?.challengeId || !isPersistedChallenge) {
      toast.error('저장된 챌린지가 아니어서 완료할 수 없어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      await api.post(`/api/challenge/${todayChallenge.challengeId}/complete`);
      const refreshedStatus = await syncCompletedState();
      await openRewardView(refreshedStatus.reward);
      toast.success('오늘의 챌린지를 완료했어요.');
    } catch (error: any) {
      if (error?.response?.status === 403) {
        try {
          const refreshedStatus = await fetchChallengeStatus();

          if (refreshedStatus.completed) {
            await syncCompletedState();
            await openRewardView(refreshedStatus.reward);
            return;
          }
        } catch (statusError) {
          console.error('챌린지 상태 재조회 실패:', statusError);
        }
      }

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        '챌린지 완료에 실패했어요. 다시 시도해주세요.';

      console.error('챌린지 완료 처리 실패:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: errorMessage,
        error,
      });
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-center text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (currentView === 'main') {
    return (
      <div className="p-4 space-y-6">
        <Card className="bg-primary text-white border-0">
          <CardContent className="p-6 text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-12 h-12 text-white" />
            </div>
            <h2 className="mb-2">S:ote의 작은 성장 챌린지</h2>
            <p className="text-sm text-white/80">
              매일 작은 실천으로 더 단단한 하루를 만들어가요.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setCurrentView('monthly-challenge')}
            variant="outline"
            className="h-20 w-full flex flex-col space-y-2 bg-card/70 backdrop-blur-sm border-border text-foreground"
          >
            <CalendarDays className="w-6 h-6 text-primary" />
            <span>챌린지 현황</span>
          </Button>

          <Button
            onClick={() => setCurrentView('badges')}
            variant="outline"
            className="h-20 w-full flex flex-col space-y-2 bg-card/70 backdrop-blur-sm border-border text-foreground"
          >
            <Trophy className="w-6 h-6 text-yellow-600" />
            <span>획득 배지</span>
          </Button>
        </div>

        <Card className="bg-card/70 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Target className="w-5 h-5 mr-2 text-primary" />
              오늘의 챌린지
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!todayChallenge?.challengeId && (
              <p className="text-center text-muted-foreground text-base md:text-lg py-6">
                아직 오늘의 챌린지가 준비되지 않았어요.
                <br />
                오늘 일기를 먼저 작성해주세요.
              </p>
            )}

            {todayChallenge?.challengeId && (
              <div className="p-4 md:p-5 rounded-xl text-center space-y-3 md:space-y-4 bg-card border border-border">
                <div className="flex items-center justify-center gap-2">
                  <EmotionChip emotion={(todayChallenge.emotionType as any) || 'JOY'} />
                  <span className="px-2.5 md:px-3 py-1 rounded-full text-xs md:text-sm bg-accent text-white">
                    {todayChallenge.category}
                  </span>
                </div>

                <p className="leading-relaxed text-foreground text-base md:text-lg lg:text-xl">
                  {todayChallenge.content}
                </p>

                {!isPersistedChallenge && (
                  <p className="text-sm text-amber-600">
                    아직 DB 저장이 확인되지 않은 추천 챌린지입니다. 완료하기 전에 잠시 기다려주세요.
                  </p>
                )}

                <div className="w-full h-px bg-border" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">진행률</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        progress === 100 ? 'bg-primary text-white' : 'bg-muted text-foreground'
                      }`}
                    >
                      {progress}%
                    </span>
                  </div>
                  <Slider
                    value={[progress]}
                    disabled={isCompleted}
                    onValueChange={(value) => {
                      setProgress(value[0]);
                      if (value[0] === 100 && progress !== 100) {
                        toast.success('챌린지 100% 달성! 완료 버튼을 눌러주세요.');
                      }
                    }}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <Button
              disabled={!isPersistedChallenge || progress < 100 || isCompleted}
              onClick={handleCompleteChallenge}
              className={`w-full ${
                isCompleted
                  ? 'bg-muted text-muted-foreground opacity-60'
                  : progress === 100 && isPersistedChallenge
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground opacity-60'
              }`}
            >
              {isCompleted ? (
                '이미 완료한 챌린지'
              ) : progress === 100 ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  완료
                </span>
              ) : (
                '진행률 100% 달성 후 완료할 수 있어요'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentView === 'monthly-challenge') {
    return <MonthlyChallengeView onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'badges') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
          <div className="p-4 md:px-8 lg:px-12">
            <div className="flex items-center justify-center relative">
              <Button variant="ghost" onClick={() => setCurrentView('main')} className="absolute left-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                뒤로
              </Button>
              <h2 className="text-foreground">획득 배지</h2>
            </div>
          </div>
        </div>

        <div className="p-4 md:px-8 lg:px-12">
          <BadgeGallery />
        </div>
      </div>
    );
  }

  if (currentView === 'lp-reward' && musicData) {
    return <LPRewardView onClose={() => setCurrentView('main')} music={musicData} />;
  }

  return null;
}
