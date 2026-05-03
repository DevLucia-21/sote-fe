import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { LPMusic } from './types';
import { LPDisc } from './LPDisc';
import { getWeekSelection } from '../../utils/date';

const emotionColors: Record<string, string> = {
  JOY: '#FFE080',
  SADNESS: '#90C8FF',
  ANGER: '#FFA0A0',
  SENSITIVE: '#C4B0FF',
  APATHY: '#C8C8C8',
};

const years = Array.from({ length: 8 }, (_, index) => 2020 + index);

interface LPWeeklyViewProps {
  musicList: LPMusic[];
  onSelectMusic: (music: LPMusic) => void;
  onWeekChange: (direction: 'prev' | 'next') => void;
  currentWeek: {
    year: number;
    month: number;
    week: number;
    start: string;
    end: string;
  };
  onDateSelect: (year: number, month: number, week: number) => void;
}

function normalizeLPList(data: any): LPMusic[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rewards)) return data.rewards;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getRewardDate(music: LPMusic) {
  return (music.rewardDate || music.recommendedAt || '').slice(0, 10);
}

export function LPWeeklyView({
  currentWeek,
  onSelectMusic,
  onWeekChange,
  onDateSelect,
}: LPWeeklyViewProps) {
  const [selectedYear, setSelectedYear] = useState(currentWeek.year);
  const [selectedMonth, setSelectedMonth] = useState(currentWeek.month);
  const [selectedDay, setSelectedDay] = useState(1);
  const [musicList, setMusicList] = useState<LPMusic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedYear(currentWeek.year);
    setSelectedMonth(currentWeek.month);
  }, [currentWeek.year, currentWeek.month]);

  const applyDate = (year: number, month: number, day: number) => {
    const week = getWeekSelection(new Date(year, month - 1, day)).week;
    onDateSelect(year, month, week);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    applyDate(year, selectedMonth, selectedDay);
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    applyDate(selectedYear, month, selectedDay);
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    applyDate(selectedYear, selectedMonth, day);
  };

  useEffect(() => {
    async function fetchWeeklyLP() {
      setLoading(true);
      try {
        const res = await api.get('/api/lp/weekly', {
          params: {
            startDate: currentWeek.start,
            endDate: currentWeek.end,
          },
        });

        const filtered = normalizeLPList(res.data).filter((music) => {
          const rewardDate = getRewardDate(music);
          return rewardDate >= currentWeek.start && rewardDate <= currentWeek.end;
        });

        const withEmotion = await Promise.all(
          filtered.map(async (music) => ({
            ...music,
            diaryEmotion: await fetchDiaryEmotion(getRewardDate(music)),
          })),
        );

        setMusicList(withEmotion);
      } catch (error) {
        console.error('LP 주간 데이터 로드 실패:', error);
        setMusicList([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWeeklyLP();
  }, [currentWeek.year, currentWeek.month, currentWeek.week, currentWeek.start, currentWeek.end]);

  async function fetchDiaryEmotion(dateString: string) {
    if (!dateString) return null;

    try {
      const res = await api.get('/api/diaries', {
        params: { date: dateString },
      });
      return res.data?.emotionType ?? null;
    } catch {
      return null;
    }
  }

  const sortedMusicList = [...musicList].sort(
    (a, b) => getRewardDate(a).localeCompare(getRewardDate(b)),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onWeekChange('prev')} className="text-[#4A3228]">
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-[#4A3228]">
              {currentWeek.year}년 {currentWeek.month}월 {currentWeek.week}주차
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64">
            <div className="p-3 space-y-3">
              <div>
                <p className="text-xs mb-1 px-2 text-muted-foreground">년도</p>
                <div className="grid grid-cols-4 gap-1">
                  {years.map((year) => (
                    <Button
                      key={year}
                      variant={year === currentWeek.year ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8"
                      onClick={() => handleYearSelect(year)}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs mb-1 px-2 text-muted-foreground">월</p>
                <div className="grid grid-cols-6 gap-1">
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                    <Button
                      key={month}
                      variant={month === selectedMonth ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8"
                      onClick={() => handleMonthSelect(month)}
                    >
                      {month}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs mb-1 px-2 text-muted-foreground">일</p>
                <div className="grid grid-cols-7 gap-1 max-h-40 overflow-y-auto">
                  {Array.from(
                    { length: new Date(selectedYear, selectedMonth, 0).getDate() },
                    (_, index) => index + 1,
                  ).map((day) => (
                    <Button
                      key={day}
                      variant={day === selectedDay ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8"
                      onClick={() => handleDaySelect(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" onClick={() => onWeekChange('next')} className="text-[#4A3228]">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {loading ? (
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="p-8 text-center text-muted-foreground">불러오는 중...</CardContent>
        </Card>
      ) : sortedMusicList.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <p className="text-[#4A3228] opacity-60">이번 주 보관된 LP가 없어요.</p>
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
                      <h3 className="font-medium truncate text-[#4A3228]">{music.title}</h3>
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <Play className="w-4 h-4" style={{ color: '#7B8B4F' }} />
                      </Button>
                    </div>

                    <p className="text-sm mb-2 opacity-70">{music.artist}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" style={{ color: '#7B8B4F', opacity: 0.6 }} />
                        <span className="text-xs opacity-60">{getRewardDate(music)}</span>
                      </div>

                      {music.emotionLabel && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: `${emotionColors[music.emotionLabel] ?? '#7B8B4F'}20`,
                            color: emotionColors[music.emotionLabel] || '#7B8B4F',
                          }}
                        >
                          {music.emotionLabel}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {music.reason && (
                  <div className="mt-3 pt-3 border-t opacity-60">{music.reason}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
