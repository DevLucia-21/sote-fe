import React, { useState, useEffect } from 'react';
import api from '../../services/api'
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
  id: number;
  date: string;
  emotionType: 'JOY' | 'SADNESS' | 'ANGER' | 'APATHY' | 'SENSITIVE';
  emotionLabel: string;
  category: string;
  content: string;
  completed: boolean;
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
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);
  const [challengesByDate, setChallengesByDate] = useState<Record<number, ChallengeData>>({});
  const [loading, setLoading] = useState(false);

  const fetchMonthlyChallenges = async (year: number, month: number) => {
    try {
      setLoading(true);

      const res = await api.get("/api/challenge/history/monthly", {
        params: { year, month },
      });
      console.log("월간 응답:", res.data);

      // API는 배열로 오니까 날짜별로 재구성
      const map: Record<number, ChallengeData> = {};

      res.data.forEach((item: ChallengeData) => {
        const day = Number(item.date.split("-")[2]); // YYYY-MM-DD → DD
        map[day] = item;
      });

      setChallengesByDate(map);

    } catch (err) {
      console.error("❌ 월간 챌린지 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyChallenges(currentMonth.year, currentMonth.month);
  }, [currentMonth]);

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

  if (selectedChallengeId) {
    return (
      <ChallengeDayDetail
        challengeId={selectedChallengeId}
        onBack={() => setSelectedChallengeId(null)}
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
                  onClick={() => {
                    console.log("선택한 ID:", challenge.id);
                    setSelectedChallengeId(challenge.id);
                  }}
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
                        {challenge.completed ? (
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
                        {challenge.completed && (
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
