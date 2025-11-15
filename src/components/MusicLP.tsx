import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Headphones } from 'lucide-react';
import { LPWeeklyView } from './lp/LPWeeklyView';
import { LPMonthlyView } from './lp/LPMonthlyView';
import { LPDetailView } from './lp/LPDetailView';
import { LPMusic, fetchWeeklyLP, fetchMonthlyLP } from './lp';

/* 💚 강제 KST 변환 함수 */
function toKST(date: Date) {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
}

/* 💚 날짜 포맷(KST 기준) */
function formatKST(date: Date) {
  return toKST(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getISOWeek(date: Date) {
  // UTC 그대로 사용 (절대 변환 금지)
  const target = new Date(date);

  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);

  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstThursdayDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstThursdayDayNr + 3);

  const week =
    1 + Math.round((target.getTime() - firstThursday.getTime()) / 604800000);

  return { year: target.getFullYear(), week };
}

function getISOWeekRange(year: number, week: number) {
  const simple = new Date(year, 0, 4 + (week - 1) * 7);
  const dayNr = (simple.getDay() + 6) % 7;
  const monday = new Date(simple);
  monday.setDate(simple.getDate() - dayNr);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // ISO는 UTC 기준, 표시할 때만 KST 변환
  return { start: monday, end: sunday };
}

/* UI 표시용 (월 기준 주차) */
function getDisplayWeekOfMonth(date: Date) {
  const d = toKST(date);  // 💛 KST 기준
  d.setDate(1);

  const firstDay = d.getDay();
  const offset = (firstDay + 6) % 7;

  return Math.floor((toKST(date).getDate() + offset - 1) / 7) + 1;
}

export function MusicLP() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [selectedMusic, setSelectedMusic] = useState<LPMusic | null>(null);
  const [allWeeklyMusic, setAllWeeklyMusic] = useState<LPMusic[]>([]);
  const [allMonthlyMusic, setAllMonthlyMusic] = useState<LPMusic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());

  const iso = getISOWeek(currentDate);
  const displayWeek = getDisplayWeekOfMonth(currentDate);

  const currentWeek = {
    isoYear: iso.year,
    isoWeek: iso.week,

    displayYear: currentDate.getFullYear(),
    displayMonth: currentDate.getMonth() + 1,
    displayWeek,
  };

  const currentMonth = {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  };

  /* 데이터 로딩 */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const weekly = await fetchWeeklyLP();
        const monthly = await fetchMonthlyLP(currentMonth.year, currentMonth.month);

        const allData = [...weekly, ...monthly];

        setAllWeeklyMusic(allData);
        setAllMonthlyMusic(allData);
      } catch (error) {
        console.error("Failed to load LP data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);


  /* 주간 필터링 (ISO 기준) */
  const filteredWeeklyMusic = allWeeklyMusic.filter((music) => {
    const musicDate = new Date(music.rewardDate);
    const isoOfMusic = getISOWeek(musicDate);

    return (
      isoOfMusic.year === currentWeek.isoYear &&
      isoOfMusic.week === currentWeek.isoWeek
    );
  });

  /* 주차 이동 */
  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate); // KST 보정하지 않는다
  };

  /* 월 이동 */
  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate); // KST 보정하지 않는다
  };

  /* 주차 선택 */
  const handleWeekSelect = (isoYear: number, isoWeek: number) => {
    const { start } = getISOWeekRange(isoYear, isoWeek);
    const mid = new Date(start);
    mid.setDate(start.getDate() + 3);
    setCurrentDate(mid);
  };

  /* 월 선택 */
  const handleMonthSelect = (year: number, month: number) => {
    const newDate = new Date(year, month - 1, 15);
    setCurrentDate(newDate);
  };

  /* 상세 페이지 */
  if (selectedMusic) {
    return (
      <div className="fixed inset-x-0 top-0 bottom-20 bg-background z-40 overflow-y-auto">
        <LPDetailView music={selectedMusic} onBack={() => setSelectedMusic(null)} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
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

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
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