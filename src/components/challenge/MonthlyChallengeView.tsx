import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { motion } from 'motion/react';
import { ChallengeDayDetail } from './ChallengeDayDetail';

interface ChallengeData {
  date: string;
  emotionType: 'JOY' | 'SADNESS' | 'ANGER' | 'APATHY' | 'SENSITIVE';
  emotionLabel: string;
  category: string;
  content: string;
  progress: number;
}

interface MonthlyChallengeViewProps {
  onBack: () => void;
}

// 감정 타입에 따른 색상
const emotionColors = {
  JOY: '#FFE080',
  SADNESS: '#90C8FF',
  ANGER: '#FFA0A0',
  SENSITIVE: '#C4B0FF',
  APATHY: '#C8C8C8',
};

// 감정 라벨
const emotionLabels = {
  JOY: '기쁨',
  SADNESS: '슬픔',
  ANGER: '분노',
  SENSITIVE: '예민',
  APATHY: '무기력',
};

export function MonthlyChallengeView({ onBack }: MonthlyChallengeViewProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeData | null>(null);

  // 더미 데이터 생성
  const generateMockChallenges = (year: number, month: number): Record<number, ChallengeData> => {
    const challenges: Record<number, ChallengeData> = {};
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const emotionTypes: Array<'JOY' | 'SADNESS' | 'ANGER' | 'APATHY' | 'SENSITIVE'> = 
      ['JOY', 'SADNESS', 'ANGER', 'APATHY', 'SENSITIVE'];
    const categories = ['운동', '음악', '취미', '관계', '휴식'];
    const contents = [
      '500보 이상 산책하기',
      '좋아하는 노래 듣기',
      '창밖 풍경 사진 찍기',
      '친구에게 안부 묻기',
      '10분 스트레칭하기',
      '일기 작성하기',
      '명상 5분 하기',
      '책 한 챕터 읽기',
      '따뜻한 차 한 잔 마시기',
      '감사한 일 3가지 적기',
    ];

    // 랜덤하게 챌린지 생성 (약 70% 확률로)
    for (let day = 1; day <= daysInMonth; day++) {
      if (Math.random() > 0.3) {
        const emotionType = emotionTypes[Math.floor(Math.random() * emotionTypes.length)];
        challenges[day] = {
          date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          emotionType,
          emotionLabel: emotionLabels[emotionType],
          category: categories[Math.floor(Math.random() * categories.length)],
          content: contents[Math.floor(Math.random() * contents.length)],
          progress: Math.random() > 0.5 ? 100 : Math.floor(Math.random() * 10) * 10,
        };
      }
    }

    return challenges;
  };

  const challengesByDate = generateMockChallenges(currentMonth.year, currentMonth.month);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      let newYear = prev.year;
      let newMonth = direction === 'next' ? prev.month + 1 : prev.month - 1;

      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }

      return { year: newYear, month: newMonth };
    });
  };

  const handleDateSelect = (year: number, month: number) => {
    setCurrentMonth({ year, month });
  };

  if (selectedChallenge) {
    return (
      <ChallengeDayDetail
        challenge={selectedChallenge}
        onBack={() => setSelectedChallenge(null)}
      />
    );
  }

  const { year, month } = currentMonth;
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen p-4 bg-background">
      {/* 헤더 */}
      <div className="relative mb-6">
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로
          </Button>
        </div>
        <h2 className="text-center text-foreground">월간 챌린지</h2>
      </div>

      {/* 월 네비게이션 */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleMonthChange('prev')}
          className="text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-foreground">
              {year}년 {month}월
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="p-2 space-y-2">
              <div>
                <p className="text-xs mb-1 px-2 text-muted-foreground">
                  년도
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {years.map((y) => (
                    <Button
                      key={y}
                      variant={y === year ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8"
                      onClick={() => handleDateSelect(y, month)}
                    >
                      {y}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs mb-1 px-2 text-muted-foreground">
                  월
                </p>
                <div className="grid grid-cols-6 gap-1">
                  {months.map((m) => (
                    <Button
                      key={m}
                      variant={m === month ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8"
                      onClick={() => handleDateSelect(year, m)}
                    >
                      {m}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleMonthChange('next')}
          className="text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* 캘린더 */}
      <Card className="bg-card/90 backdrop-blur-sm border-border shadow-md">
        <CardContent className="p-4">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div
                key={day}
                className={`text-center text-xs md:text-sm py-1 md:py-2 ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-foreground'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 캘린더 그리드 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-7 gap-1"
          >
            {/* 빈 칸 (월 시작 전) */}
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* 날짜 칸 */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const challenge = challengesByDate[day];

              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className={`aspect-square border border-border rounded-lg p-0.5 md:p-1 flex flex-col ${
                    challenge 
                      ? 'cursor-pointer transition-colors challenge-cell' 
                      : 'bg-muted/30'
                  }`}
                  style={{
                    backgroundColor: challenge ? '#FFFFFF' : undefined,
                  }}
                  onClick={challenge ? () => setSelectedChallenge(challenge) : undefined}
                >
                  {/* 날짜 */}
                  <span className="text-[0.55rem] md:text-xs mb-0.5 md:mb-1 text-muted-foreground">
                    {day}
                  </span>

                  {/* 챌린지 정보 */}
                  {challenge && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-0.5 md:space-y-1">
                      {/* 모바일: 완료/미완료 작은 칩 */}
                      <div className="md:hidden w-full h-full flex items-center justify-center">
                        {challenge.progress === 100 ? (
                          <div className="text-[0.5rem] px-1.5 py-0.5 rounded-full bg-primary text-white">
                            ✓
                          </div>
                        ) : (
                          <div className="text-[0.5rem] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                            ○
                          </div>
                        )}
                      </div>

                      {/* 데스크톱: 전체 정보 표시 */}
                      <div className="hidden md:flex flex-col items-center justify-center space-y-1 lg:space-y-1.5 w-full">
                        {/* 감정 라벨 */}
                        <div
                          className="px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full text-xs lg:text-sm text-foreground"
                          style={{
                            backgroundColor: emotionColors[challenge.emotionType],
                            fontWeight: 600,
                          }}
                        >
                          {challenge.emotionLabel}
                        </div>

                        {/* 챌린지명 */}
                        <p 
                          className="text-sm lg:text-base text-center line-clamp-2 leading-tight text-foreground px-0.5"
                          style={{ fontWeight: 500 }}
                        >
                          {challenge.content}
                        </p>

                        {/* 완료 표시 */}
                        {challenge.progress === 100 && (
                          <div 
                            className="text-xs lg:text-sm px-2 py-0.5 lg:px-2.5 lg:py-1 rounded bg-primary text-white"
                            style={{ fontWeight: 600 }}
                          >
                            완료
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>

      {Object.keys(challengesByDate).length === 0 && (
        <Card className="bg-white/70 backdrop-blur-sm mt-4">
          <CardContent className="p-8 text-center">
            <p className="text-[#4A3228] opacity-60">이번 달 추천된 챌린지가 없어요.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
