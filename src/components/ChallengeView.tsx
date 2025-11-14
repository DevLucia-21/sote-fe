import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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
import { toast } from 'sonner@2.0.3';

type ViewMode = 'main' | 'badges' | 'lp-reward' | 'monthly-challenge';

export function ChallengeView() {
  const [currentView, setCurrentView] = useState<ViewMode>('main');
  const [progress, setProgress] = useState<number>(0);
  
  // 더미 챌린지 데이터
  const dummyChallenge = {
    id: 1,
    content: '500보 이상 산책하기',
    emotionType: 'SADNESS' as const,
    category: '운동',
  };

  // 메인 화면 (원래 버전 레이아웃)
  if (currentView === 'main') {
    return (
      <div className="p-4 space-y-6">
        {/* 상단 배너 */}
        <Card className="bg-primary text-white border-0">
          <CardContent className="p-6 text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-12 h-12 text-white" />
            </div>
            <h2 className="mb-2">S:ote와 함께 성장하세요!</h2>
            <p className="text-sm text-white/80">
              매일의 작은 도전으로 더 나은 내일을 만들어가요
            </p>
          </CardContent>
        </Card>

        {/* 메뉴 버튼 */}
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
            <span>영광의 흔적</span>
          </Button>
        </div>

        {/* 오늘의 챌린지 - 바로 표시 */}
        <Card className="bg-card/70 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Target className="w-5 h-5 mr-2 text-primary" />
              오늘의 챌린지
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 챌린지 내용 상자 - 통합 */}
            <div 
              className="p-4 md:p-5 rounded-xl text-center space-y-3 md:space-y-4 bg-card border border-border"
            >
              {/* 감정/카테고리 태그 */}
              <div className="flex items-center justify-center gap-2">
                <EmotionChip emotion={dummyChallenge.emotionType} />
                <span
                  className="px-2.5 md:px-3 py-1 rounded-full text-xs md:text-sm bg-accent text-white"
                >
                  {dummyChallenge.category}
                </span>
              </div>
              
              {/* 챌린지 내용 */}
              <p
                className="leading-relaxed text-foreground text-base md:text-lg lg:text-xl"
              >
                {dummyChallenge.content}
              </p>

              {/* 구분선 */}
              <div 
                className="w-full h-px bg-border"
              />

              {/* 진행률 섹션 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    진행률
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      progress === 100 
                        ? 'bg-primary text-white' 
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {progress}%
                  </span>
                </div>
                <Slider
                  value={[progress]}
                  onValueChange={(value) => {
                    setProgress(value[0]);
                    if (value[0] === 100 && progress !== 100) {
                      toast.success('챌린지 100% 달성! 완료 버튼을 눌러주세요 🎉');
                    }
                  }}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>

            {/* 버튼 */}
            <Button
              className={`w-full ${
                progress === 100 
                  ? 'bg-primary text-white hover:bg-primary/90' 
                  : 'bg-muted text-muted-foreground opacity-60'
              }`}
              onClick={() => setCurrentView('lp-reward')}
              disabled={progress < 100}
            >
              {progress === 100 ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  완료
                </span>
              ) : (
                '진행률 100% 달성 후 확인 가능'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 챌린지 현황 화면
  if (currentView === 'monthly-challenge') {
    return <MonthlyChallengeView onBack={() => setCurrentView('main')} />;
  }

  // 영광의 흔적 화면
  if (currentView === 'badges') {
    return (
      <div className="min-h-screen bg-background">
        {/* 헤더 */}
        <div className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
          <div className="p-4 md:px-8 lg:px-12">
            <div className="flex items-center justify-center relative">
              <Button variant="ghost" onClick={() => setCurrentView('main')} className="absolute left-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                뒤로
              </Button>
              <h2 className="text-foreground">영광의 흔적</h2>
            </div>
          </div>
        </div>
        
        {/* 배지 갤러리 */}
        <div className="p-4 md:px-8 lg:px-12">
          <BadgeGallery />
        </div>
      </div>
    );
  }

  // LP 보상 화면
  if (currentView === 'lp-reward') {
    return <LPRewardView onClose={() => setCurrentView('main')} />;
  }

  return null;
}
