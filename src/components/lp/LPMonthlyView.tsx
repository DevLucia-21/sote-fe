import React, { useState, useEffect } from 'react';
import api from '../../services/api'
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { motion } from 'motion/react';
import { LPMusic } from './types';
import { LPDisc } from './LPDisc';

interface LPMonthlyViewProps {
  musicList: LPMusic[];
  currentMonth: { year: number; month: number };
  onSelectMusic: (music: LPMusic) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onDateSelect: (year: number, month: number) => void;
}

const emotionColors: Record<string, string> = {
  JOY: "#FFE080",
  SADNESS: "#90C8FF",
  ANGER: "#FFA0A0",
  SENSITIVE: "#C4B0FF",
  APATHY: "#C8C8C8",
};

export function LPMonthlyView({
  currentMonth,
  onSelectMusic,
  onMonthChange,
  onDateSelect,
}: LPMonthlyViewProps) {
  const { year, month } = currentMonth;

  const [musicList, setMusicList] = useState<LPMusic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMonthlyLP() {
      setLoading(true);
      try {
        const res = await api.get(`/api/lp/monthly?year=${year}&month=${month}`);
        const list = res.data;

        console.log("📦 LP Monthly Raw:", list);

        // 🔥 감정 가져오기
        const withEmotion = await Promise.all(
          list.map(async (m: LPMusic) => {
            const dateStr = (m.rewardDate || m.recommendedAt || '').slice(0, 10);

            try {
              const diaryRes = await api.get(`/api/diaries?date=${dateStr}`);
              const emotion = diaryRes.data?.emotionType; // JOY, SADNESS 등

              console.log("🎨 감정 가져오기 성공:", dateStr, emotion);

              return {
                ...m,
                diaryEmotion: emotion,
              };
            } catch (e) {
              console.log("⚠️ 감정 없음:", dateStr);
              return {
                ...m,
                diaryEmotion: null,
              };
            }
          })
        );

        console.log("🎨 감정 병합 완료:", withEmotion);
        setMusicList(withEmotion);
      } catch (e) {
        console.error("❌ 월간 LP 불러오기 실패:", e);
        setMusicList([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMonthlyLP();
  }, [year, month]);

  // 캘린더 계산
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // 날짜별 LP 매핑
  const lpByDate: Record<string, LPMusic> = {};
  musicList.forEach((music) => {
    const [rewardYear, rewardMonth, rewardDay] = (music.rewardDate || music.recommendedAt || '')
      .slice(0, 10)
      .split('-')
      .map(Number);

    if (rewardYear === year && rewardMonth === month) {
      lpByDate[rewardDay] = music;
    }
  });

  // 년도 목록 (2020~2025)
  const years = Array.from({ length: 8 }, (_, index) => 2020 + index);

  // 월 목록
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange('prev')}
          className="text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* 통합 날짜 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-foreground">
              {year}년 {month}월
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="p-2 space-y-2">
              {/* 년도 선택 */}
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
                      onClick={() => onDateSelect(y, month)}
                    >
                      {y}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 월 선택 */}
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
                      onClick={() => onDateSelect(year, m)}
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
          onClick={() => onMonthChange('next')}
          className="text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* 캘린더 */}
      <Card className="bg-card/90 backdrop-blur-sm border-border shadow-md">
        <CardContent className="p-2 md:p-4">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-1 md:mb-2">
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
            className="grid grid-cols-7 gap-0.5 md:gap-1"
          >
            {/* 빈 칸 (월 시작 전) */}
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* 날짜 칸 */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const music = lpByDate[day];

              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className={`aspect-square border border-border rounded-lg relative overflow-hidden ${
                    music ? 'cursor-pointer bg-card hover:bg-accent/50 transition-colors' : 'bg-background'
                  }`}
                  onClick={music ? () => onSelectMusic(music) : undefined}
                >
                  {/* 날짜 - 왼쪽 상단에 절대 위치 */}
                  <span 
                    className="absolute top-0.5 left-1 text-[0.55rem] md:text-xs z-10 text-foreground/70"
                  >
                    {day}
                  </span>

                  {/* LP 디스크 - 모바일: 오른쪽 하단에 크게(일부만 보임), 데스크톱: 중앙에 전체 */}
                  {music && (
                    <>
                      {/* 모바일 버전 */}
                      <div className="md:hidden absolute -bottom-3 -right-3">
                        <div className="w-[48px] h-[48px]">
                          <LPDisc 
                            albumImageUrl={music.albumImageUrl} 
                            title={music.title} 
                            size="sm"
                            emotionColor={
                              music.diaryEmotion
                                ? emotionColors[music.diaryEmotion]
                                : '#7B8B4F'
                            }
                          />
                        </div>
                      </div>

                      {/* 데스크톱 버전 */}
                      <div className="hidden md:flex absolute inset-0 flex-col items-center justify-center px-[10%] pt-[18%] pb-[14%]">
                        <div className="flex items-center justify-center w-full mb-[3%]">
                          <div className="w-[60%] aspect-square">
                            <LPDisc 
                              albumImageUrl={music.albumImageUrl} 
                              title={music.title} 
                              size="sm"
                              emotionColor={
                                music.diaryEmotion
                                  ? emotionColors[music.diaryEmotion]
                                  : '#7B8B4F'
                              }
                            />
                          </div>
                        </div>
                        {/* 곡 정보 */}
                        <div className="text-center w-full" style={{ fontSize: 'clamp(0.6rem, 1.2vw, 0.75rem)' }}>
                          <p className="truncate leading-tight mb-0.5 text-foreground">
                            {music.title}
                          </p>
                          <p className="truncate leading-tight text-muted-foreground" style={{ fontSize: '0.9em' }}>
                            {music.artist}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>

      {musicList.length === 0 && (
        <Card className="bg-card/70 backdrop-blur-sm border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">이번 달 보관된 LP가 없어요.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
