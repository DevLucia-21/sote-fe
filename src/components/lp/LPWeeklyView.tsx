import React, { useState, useEffect } from 'react';
import api from '../../services/api'
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Play, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { LPMusic } from './types';
import { LPDisc } from './LPDisc';

/* 💚 UI 표시에만 사용하는 KST 변환 */
function toKST(date: Date) {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
}

/* 💚 ISO Week (UTC 기준, 변경 금지) */
function getISOWeek(date: Date) {
  const target = new Date(date); // UTC 그대로 사용
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);

  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstThursdayDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstThursdayDayNr + 3);

  const week =
    1 +
    Math.round(
      (target.getTime() - firstThursday.getTime()) / 604800000
    );

  return { year: target.getFullYear(), week };
}

/* 💚 ISO 주차 범위 (UTC 기준) */
function getISOWeekRange(year: number, week: number) {
  const simple = new Date(year, 0, 4 + (week - 1) * 7);
  const dayNr = (simple.getDay() + 6) % 7;

  const monday = new Date(simple);
  monday.setDate(simple.getDate() - dayNr);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { start: monday, end: sunday }; // UTC 그대로 반환
}

function normalizeISO(year, week) {
  if (week < 1) {
    // 전년도 마지막 ISO 주를 구해오기
    const lastWeek = getISOWeek(new Date(year - 1, 11, 31)).week;
    return { year: year - 1, week: lastWeek };
  }
  if (week > 53) {
    // 다음년도 첫 ISO 주 확인
    const nextFirst = getISOWeek(new Date(year + 1, 0, 1)).week;
    return { year: year + 1, week: nextFirst };
  }
  return { year, week };
}

/* 감정 색상 */
const emotionColors: Record<string, string> = {
  'JOY': '#FFE080',
  'SADNESS': '#90C8FF',
  'ANGER': '#FFA0A0',
  'SENSITIVE': '#C4B0FF',
  'APATHY': '#C8C8C8',
};

// 년도 목록 (2020~2025)
const years = [2020, 2021, 2022, 2023, 2024, 2025];

interface LPWeeklyViewProps {
  musicList: LPMusic[];
  onSelectMusic: (music: LPMusic) => void;
  onWeekChange: (direction: 'prev' | 'next') => void;

  currentWeek: {
    isoYear: number;
    isoWeek: number;

    displayYear: number;
    displayMonth: number;
    displayWeek: number;
  };

  onDateSelect: (isoYear: number, isoWeek: number) => void;
}

export function LPWeeklyView({
  currentWeek,
  onSelectMusic,
  onWeekChange,
  onDateSelect,
}: LPWeeklyViewProps) {
  const [selectedYear, setSelectedYear] = useState(currentWeek.displayYear);
  const [selectedMonth, setSelectedMonth] = useState(currentWeek.displayMonth);
  const [selectedDay, setSelectedDay] = useState(1);

  const [musicList, setMusicList] = useState<LPMusic[]>([]);
  const [loading, setLoading] = useState(true);

  const applyDate = (year: number, month: number, day: number) => {
    const date = new Date(Date.UTC(year, month - 1, day));
    const { year: isoYear, week: isoWeek } = getISOWeek(date);
    onDateSelect(isoYear, isoWeek);
  };

  const handleYearSelect = (y: number) => {
    setSelectedYear(y);
    applyDate(y, selectedMonth, selectedDay);
  };

  const handleMonthSelect = (m: number) => {
    setSelectedMonth(m);
    applyDate(selectedYear, m, selectedDay);
  };

  const handleDaySelect = (d: number) => {
    setSelectedDay(d);
    applyDate(selectedYear, selectedMonth, d);
  };

  /* ==========================
      🔥 API 호출 (ISO 기준)
     ========================== */
  useEffect(() => {
    async function fetchWeeklyLP() {
      try {        
        function getAroundWeeks(year, week) {
          const mid = normalizeISO(year, week);
          const left = normalizeISO(year, week - 1);
          const right = normalizeISO(year, week + 1);
          return { left, mid, right };
        }

        const { left, mid, right } = getAroundWeeks(currentWeek.isoYear, currentWeek.isoWeek);

        const resL = await api.get(`/api/lp/weekly?year=${left.year}&week=${left.week}`);
        const resM = await api.get(`/api/lp/weekly?year=${mid.year}&week=${mid.week}`);
        const resR = await api.get(`/api/lp/weekly?year=${right.year}&week=${right.week}`);

        const all = [...resL.data, ...resM.data, ...resR.data];

        // 최종 ISO 기준 필터링
        const filtered = all.filter((m) => {
          const iso = getISOWeek(new Date(m.rewardDate));
          return iso.year === currentWeek.isoYear && iso.week === currentWeek.isoWeek;
        });
        const withEmotion = await Promise.all(
          filtered.map(async (m) => {
            const date = m.rewardDate.slice(0, 10);
            const diaryEmotion = await fetchDiaryEmotion(date);

            console.log(
              `🎵 LP '${m.title}' (${date}) → diaryEmotion: ${diaryEmotion}`
            );

            return { ...m, diaryEmotion };
          })
        );

        console.log("📦 최종 병합된 LP 데이터:", withEmotion);
        setMusicList(withEmotion);
      } catch (e) {
        console.error("❌ LP 주간 데이터 로드 실패:", e);
        setMusicList([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWeeklyLP();
  }, [currentWeek.isoYear, currentWeek.isoWeek]);

  /* LP 정렬 */
  const sortedMusicList = [...musicList].sort(
    (a, b) =>
      new Date(a.rewardDate).getTime() - new Date(b.rewardDate).getTime()
  );

  async function fetchDiaryEmotion(dateString: string) {
    try {
      const res = await api.get(`/api/diaries?date=${dateString}`);

      console.log(`📅 일기 감정 API 응답(${dateString}):`, res.data);

      if (!res.data || !res.data.emotionType) {
        console.log(`⚠️ ${dateString} 감정 없음`);
        return null;
      }

      console.log(`🎨 감정 매핑됨 → ${dateString} = ${res.data.emotionType}`);
      return res.data.emotionType;
    } catch (e) {
      console.error(`❌ ${dateString} 감정 조회 실패:`, e);
      return null;
    }
  }

  return (
    <div className="space-y-4">
      {/* 주차 네비게이션 */}
        <div className="flex items-center justify-center gap-2">

          {/* 이전 주차 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onWeekChange('prev')}
            className="text-[#4A3228]"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* 📌 연/월/일 선택 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-[#4A3228]">
                {currentWeek.displayYear}년 {currentWeek.displayMonth}월 {currentWeek.displayWeek}주차
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-64">
              <div className="p-3 space-y-3">

                {/* 📌 연도 선택 */}
                <div>
                  <p className="text-xs mb-1 px-2 text-muted-foreground">년도</p>
                  <div className="grid grid-cols-3 gap-1">
                    {years.map((y) => (
                      <Button
                        key={y}
                        variant={y === currentWeek.displayYear ? "default" : "ghost"}
                        size="sm"
                        className="h-8"
                        onClick={() => handleYearSelect(y)}
                      >
                        {y}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 📌 월 선택 */}
                <div>
                  <p className="text-xs mb-1 px-2 text-muted-foreground">월</p>
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <Button
                        key={m}
                        variant={m === selectedMonth ? "default" : "ghost"}
                        size="sm"
                        className="h-8"
                        onClick={() => handleMonthSelect(m)}
                      >
                        {m}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 📌 일 선택 */}
                <div>
                  <p className="text-xs mb-1 px-2 text-muted-foreground">일</p>
                  <div className="grid grid-cols-7 gap-1 max-h-40 overflow-y-auto">
                    {Array.from(
                      { length: new Date(selectedYear, selectedMonth, 0).getDate() },
                      (_, i) => i + 1
                    ).map((d) => (
                      <Button
                        key={d}
                        variant={d === selectedDay ? "default" : "ghost"}
                        size="sm"
                        className="h-8"
                        onClick={() => handleDaySelect(d)}
                      >
                        {d}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 다음 주차 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onWeekChange('next')}
            className="text-[#4A3228]"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

      {/* LP 목록 */}
      {sortedMusicList.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <p className="text-[#4A3228] opacity-60">
              이번 주 보관된 LP가 없어요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedMusicList.map((music) => (
            <Card
              key={music.id}
              className="bg-white/70 backdrop-blur-sm hover:bg-white/80 transition-colors cursor-pointer"
              onClick={() => onSelectMusic(music)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <LPDisc
                    albumImageUrl={music.albumImageUrl}
                    title={music.title}
                    size="md"
                    emotionColor={
                      music.diaryEmotion
                        ? emotionColors[music.diaryEmotion] || '#7B8B4F'
                        : '#7B8B4F'
                    }
                  />

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate text-[#4A3228]">
                        {music.title}
                      </h3>

                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <Play className="w-4 h-4" style={{ color: '#7B8B4F' }} />
                      </Button>
                    </div>

                    <p className="text-sm mb-2 opacity-70">{music.artist}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar
                          className="w-3 h-3"
                          style={{ color: '#7B8B4F', opacity: 0.6 }}
                        />
                        <span className="text-xs opacity-60">
                          {toKST(new Date(music.rewardDate)).toLocaleDateString(
                            'ko-KR',
                            { month: 'long', day: 'numeric' }
                          )}
                        </span>
                      </div>

                      {music.emotionLabel && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor:
                              emotionColors[music.emotionLabel] + '20',
                            color:
                              emotionColors[music.emotionLabel] || '#7B8B4F',
                          }}
                        >
                          {music.emotionLabel}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {music.reason && (
                  <div className="mt-3 pt-3 border-t opacity-60">
                    💡 {music.reason}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}