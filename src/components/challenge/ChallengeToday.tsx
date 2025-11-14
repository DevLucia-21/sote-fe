import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { EmotionChip } from './EmotionChip';
import { MiniTimeline7 } from './MiniTimeline7';
import { EmptyState } from './EmptyState';
import { ChallengeCompleteDialog } from './ChallengeCompleteDialog';
import { BadgeUnlockAnimation } from './BadgeUnlockAnimation';
import { TodayChallengeStatus, ChallengeDefinitionResponse, SevenDayProgress, BadgeWithStatus } from './types';
import { mockAllBadgeDefinitions } from './mockData';
import { Sparkles, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ChallengeTodayProps {
  // API 연동을 위한 props (현재는 mock 사용)
  onFetchStatus?: () => Promise<TodayChallengeStatus>;
  onFetchToday?: () => Promise<ChallengeDefinitionResponse>;
  onComplete?: (id: number) => Promise<TodayChallengeStatus>;
  onFetchSevenDayProgress?: () => Promise<SevenDayProgress[]>;
}

export function ChallengeToday({
  onFetchStatus,
  onFetchToday,
  onComplete,
  onFetchSevenDayProgress,
}: ChallengeTodayProps) {
  const [status, setStatus] = useState<TodayChallengeStatus>({
    recommended: false,
    completed: false,
  });
  const [sevenDayProgress, setSevenDayProgress] = useState<SevenDayProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<BadgeWithStatus | null>(null);
  const [totalCompletedCount, setTotalCompletedCount] = useState(0); // Mock 완료 횟수
  const [progress, setProgress] = useState<number>(0); // 챌린지 진행률 (0-100)

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Mock 데이터 로드
      const mockStatus: TodayChallengeStatus = {
        recommended: false,
        completed: false,
      };
      setStatus(mockStatus);

      // 최근 7일 진행 현황 Mock
      const mockProgress: SevenDayProgress[] = [
        { date: '2025-10-26', completed: true },
        { date: '2025-10-27', completed: false },
        { date: '2025-10-28', completed: true },
        { date: '2025-10-29', completed: true },
        { date: '2025-10-30', completed: false },
        { date: '2025-10-31', completed: true },
        { date: '2025-11-01', completed: false },
      ];
      setSevenDayProgress(mockProgress);
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
      toast.error('잠시 후 다시 시도해 주세요.');
    }
  };

  // 챌린지 받기 (일기 분석 후 자동으로 추천된다고 가정)
  const handleGetChallenge = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Mock: 일기 분석 후 추천된 챌린지
      const mockChallenge: TodayChallengeStatus = {
        recommended: true,
        completed: false,
        challengeId: 1,
        content: '500보 이상 산책하기',
        emotionType: 'SADNESS',
        category: '운동',
      };
      
      setStatus(mockChallenge);
      setProgress(0); // 진행률 초기화
      toast.success('일기 분석 기반 챌린지가 추천되었어요.');
    } catch (error) {
      console.error('챌린지 받기 실패:', error);
      toast.error('잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 배지 획득 체크
  const checkBadgeUnlock = (completedCount: number, emotionType?: string, category?: string) => {
    // 배지 조건 달성 횟수 (1, 10, 20, 30)
    const milestones = [1, 10, 20, 30];
    
    if (!milestones.includes(completedCount)) return null;

    // 공통 배지 (감정/카테고리 무관)
    if (completedCount === 1) {
      return mockAllBadgeDefinitions.find(b => b.id === 1); // 챌린지 입문자
    }
    
    if (completedCount === 10) {
      return mockAllBadgeDefinitions.find(b => b.id === 2); // 챌린지 마스터 I
    }
    
    if (completedCount === 20) {
      return mockAllBadgeDefinitions.find(b => b.id === 3); // 챌린지 마스터 II
    }
    
    if (completedCount === 30) {
      return mockAllBadgeDefinitions.find(b => b.id === 4); // 챌린지 마스터 III
    }

    return null;
  };

  // 챌린지 완료
  const handleCompleteChallenge = async () => {
    if (!status.challengeId) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock: 완료 상태 업데이트
      const completedStatus: TodayChallengeStatus = {
        ...status,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      
      setStatus(completedStatus);
      setShowCompleteDialog(false);
      setProgress(0); // 진행률 초기화
      
      // 완료 횟수 증가
      const newCount = totalCompletedCount + 1;
      setTotalCompletedCount(newCount);
      
      toast.success('좋아요! 오늘의 챌린지 완료 🎉');
      
      // 7일 진행 현황 업데이트
      const today = new Date().toISOString().split('T')[0];
      setSevenDayProgress(prev =>
        prev.map(day => (day.date === today ? { ...day, completed: true } : day))
      );

      // 배지 획득 체크 (약간의 딜레이 후)
      setTimeout(() => {
        const newBadge = checkBadgeUnlock(newCount, status.emotionType, status.category);
        if (newBadge) {
          setUnlockedBadge({
            ...newBadge,
            isUnlocked: true,
            awardedAt: new Date().toISOString(),
          });
        }
      }, 1000);
    } catch (error) {
      console.error('챌린지 완료 실패:', error);
      toast.error('잠시 후 다시 시도해 주세요.');
      throw error;
    }
  };

  // 상태별 렌더링
  const renderContent = () => {
    // 상태 1: 미추천
    if (!status.recommended) {
      return (
        <div
          className="rounded-2xl p-8 shadow-sm"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <EmptyState
            title="아직 추천받은 챌린지가 없어요."
            description="일기를 작성하고 감정 분석을 받으면 맞춤 챌린지가 추천됩니다."
            icon={
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#F5F1E8' }}
              >
                <Sparkles size={40} style={{ color: '#7B8B4F' }} />
              </div>
            }
          />
          <Button
            className="w-full"
            onClick={handleGetChallenge}
            disabled={isLoading}
            style={{
              backgroundColor: '#7B8B4F',
              color: '#FFFFFF',
            }}
          >
            {isLoading ? '불러오는 중...' : '테스트: 챌린지 받기'}
          </Button>
        </div>
      );
    }

    // 상태 2: 추천됨 (미완료)
    if (status.recommended && !status.completed) {
      return (
        <div
          className="rounded-2xl p-6 shadow-sm relative overflow-hidden"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#7B8B4F' }}
              />
              {status.emotionType && <EmotionChip emotion={status.emotionType} />}
              {status.category && (
                <span
                  className="px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: '#5D3F35',
                    color: '#FFFFFF',
                    opacity: 0.8,
                  }}
                >
                  {status.category}
                </span>
              )}
            </div>
            <span
              className="px-3 py-1 rounded-full text-sm"
              style={{
                backgroundColor: '#FFF4E6',
                color: '#E67E22',
              }}
            >
              일기 분석 추천
            </span>
          </div>

          {/* 본문 */}
          <p
            className="mb-6 leading-relaxed"
            style={{
              color: '#4A3228',
              fontSize: '18px',
              lineHeight: '1.6',
            }}
          >
            {status.content}
          </p>

          {/* 진행률 섹션 */}
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#F5F1E8' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: '#4A3228', opacity: 0.7 }}>
                진행률
              </span>
              <span
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: progress === 100 ? '#7B8B4F' : '#FFFFFF',
                  color: progress === 100 ? '#FFFFFF' : '#4A3228',
                }}
              >
                {progress}%
              </span>
            </div>
            <div className="relative">
              <Slider
                value={[progress]}
                onValueChange={(value) => {
                  setProgress(value[0]);
                  if (value[0] === 100 && !status.completed && progress !== 100) {
                    toast.success('챌린지 100% 달성! 완료 버튼을 눌러주세요 🎉');
                  }
                }}
                max={100}
                step={1}
                className="w-full"
                style={{
                  // @ts-ignore
                  '--slider-track-bg': '#E5E5E5',
                  '--slider-range-bg': progress === 100 ? '#7B8B4F' : '#5D3F35',
                  '--slider-thumb-border': progress === 100 ? '#7B8B4F' : '#5D3F35',
                }}
              />
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: '#4A3228', opacity: 0.6 }}>
              슬라이더를 움직여 진행률을 조정하세요
            </p>
          </div>

          {/* 버튼 */}
          <Button
            className="w-full"
            onClick={() => setShowCompleteDialog(true)}
            disabled={progress < 100}
            style={{
              backgroundColor: progress === 100 ? '#7B8B4F' : '#E5E5E5',
              color: progress === 100 ? '#FFFFFF' : '#4A3228',
              opacity: progress === 100 ? 1 : 0.6,
            }}
          >
            {progress === 100 ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 size={18} />
                완료하기
              </span>
            ) : (
              '진행률 100% 달성 후 완료 가능'
            )}
          </Button>
        </div>
      );
    }

    // 상태 3: 완료
    if (status.completed && status.completedAt) {
      const completedTime = new Date(status.completedAt).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      return (
        <div
          className="rounded-2xl p-6 shadow-sm relative overflow-hidden"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          {/* 완료 배경 효과 */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: '#7B8B4F' }}
          />

          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#7B8B4F' }}
              />
              {status.emotionType && <EmotionChip emotion={status.emotionType} />}
              {status.category && (
                <span
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: '#5D3F35',
                    color: '#FFFFFF',
                    opacity: 0.8,
                  }}
                >
                  {status.category}
                </span>
              )}
            </div>
            <span
              className="px-3 py-1 rounded-full"
              style={{
                backgroundColor: '#E8F5E9',
                color: '#4CAF50',
              }}
            >
              완료됨
            </span>
          </div>

          {/* 본문 */}
          <p
            className="mb-2 leading-relaxed"
            style={{
              color: '#4A3228',
              fontSize: '18px',
              lineHeight: '1.6',
            }}
          >
            {status.content}
          </p>
          <p className="mb-6 text-sm" style={{ color: '#4A3228', opacity: 0.6 }}>
            완료 시간: {completedTime}
          </p>

          {/* 버튼 */}
          <Button
            className="w-full"
            disabled
            style={{
              backgroundColor: '#E5E5E5',
              color: '#4A3228',
              opacity: 0.6,
            }}
          >
            완료됨
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* 메인 카드 */}
      {renderContent()}

      {/* 완료 확인 다이얼로그 */}
      {status.challengeId && (
        <ChallengeCompleteDialog
          open={showCompleteDialog}
          onOpenChange={setShowCompleteDialog}
          content={status.content || ''}
          emotionType={status.emotionType}
          category={status.category}
          onComplete={handleCompleteChallenge}
          onViewReward={() => {
            toast.info('LP 보상 페이지는 준비 중입니다.');
          }}
        />
      )}

      {/* 배지 획득 애니메이션 */}
      <BadgeUnlockAnimation
        badge={unlockedBadge}
        onClose={() => setUnlockedBadge(null)}
      />
    </div>
  );
}
