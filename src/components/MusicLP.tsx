import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Headphones } from 'lucide-react';
import { LPWeeklyView } from './lp/LPWeeklyView';
import { LPMonthlyView } from './lp/LPMonthlyView';
import { LPDetailView } from './lp/LPDetailView';
import { LPMusic, fetchWeeklyLP, fetchMonthlyLP } from './lp';

// 주차 계산 함수
function getWeekOfMonth(date: Date): number {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const offsetDate = date.getDate() + firstDayOfWeek - 1;
  return Math.ceil(offsetDate / 7);
}

// 특정 년/월/주차의 시작일과 종료일 계산
function getWeekRange(year: number, month: number, week: number): { start: Date; end: Date } {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // 주차의 시작일 계산
  const startDay = (week - 1) * 7 - firstDayOfWeek + 1;
  const start = new Date(year, month - 1, startDay);

  // 주차의 종료일 계산
  const endDay = startDay + 6;
  const end = new Date(year, month - 1, endDay);

  return { start, end };
}

// 날짜가 특정 주차에 속하는지 확인
function isDateInWeek(date: Date, year: number, month: number, week: number): boolean {
  const { start, end } = getWeekRange(year, month, week);
  return date >= start && date <= end;
}

export function MusicLP() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [selectedMusic, setSelectedMusic] = useState<LPMusic | null>(null);
  const [allWeeklyMusic, setAllWeeklyMusic] = useState<LPMusic[]>([]);
  const [allMonthlyMusic, setAllMonthlyMusic] = useState<LPMusic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 주간/월간 네비게이션 상태
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentWeek = {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    week: getWeekOfMonth(currentDate),
  };
  const currentMonth = {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  };

  // 데이터 로딩 (API 연동 시뮬레이션)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // TODO: 실제 API 호출로 대체
        // 주간/월간 데이터를 모두 로드 (실제 API에서는 범위별로 요청)
        const weekly = await fetchWeeklyLP();
        const monthly = await fetchMonthlyLP(currentMonth.year, currentMonth.month);
        
        // 주간과 월간 데이터를 모두 합쳐서 사용
        const allData = [...weekly, ...monthly];

        setAllWeeklyMusic(allData);
        setAllMonthlyMusic(allData);
      } catch (error) {
        console.error('Failed to load LP data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 현재 주차에 해당하는 LP만 필터링
  const filteredWeeklyMusic = allWeeklyMusic.filter((music) => {
    const musicDate = new Date(music.rewardDate);
    return isDateInWeek(musicDate, currentWeek.year, currentWeek.month, currentWeek.week);
  });

  // 주차 변경
  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  // 월 변경
  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  // 주차 직접 선택
  const handleWeekSelect = (year: number, month: number, week: number) => {
    const newDate = new Date(year, month - 1, 1);
    const firstDayOfWeek = newDate.getDay();
    const targetDay = (week - 1) * 7 - firstDayOfWeek + 1;
    newDate.setDate(targetDay + 3); // 주차의 중간쯤으로 설정
    setCurrentDate(newDate);
  };

  // 월 직접 선택
  const handleMonthSelect = (year: number, month: number) => {
    const newDate = new Date(year, month - 1, 15); // 해당 월의 15일로 설정
    setCurrentDate(newDate);
  };

  // 상세 페이지 표시 (fixed overlay로)
  if (selectedMusic) {
    return (
      <div className="fixed inset-x-0 top-0 bottom-20 bg-background z-40 overflow-y-auto">
        <LPDetailView music={selectedMusic} onBack={() => setSelectedMusic(null)} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl flex items-center text-foreground">
          <Headphones className="w-6 h-6 mr-2" style={{ color: '#7B8B4F' }} />
          음악 LP
        </h1>
        <Tabs
          value={selectedPeriod}
          onValueChange={(value) => setSelectedPeriod(value as 'week' | 'month')}
        >
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="week">주간</TabsTrigger>
            <TabsTrigger value="month">월간</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 컨텐츠 */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          로딩 중...
        </div>
      ) : (
        <>
          {selectedPeriod === 'week' && (
            <LPWeeklyView
              musicList={filteredWeeklyMusic}
              currentWeek={currentWeek}
              onSelectMusic={setSelectedMusic}
              onWeekChange={handleWeekChange}
              onDateSelect={handleWeekSelect}
            />
          )}
          {selectedPeriod === 'month' && (
            <LPMonthlyView
              musicList={allMonthlyMusic}
              currentMonth={currentMonth}
              onSelectMusic={setSelectedMusic}
              onMonthChange={handleMonthChange}
              onDateSelect={handleMonthSelect}
            />
          )}
        </>
      )}
    </div>
  );
}