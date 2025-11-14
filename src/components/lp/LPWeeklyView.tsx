import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Play, Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { LPMusic } from './types';
import { LPDisc } from './LPDisc';

interface LPWeeklyViewProps {
  musicList: LPMusic[];
  currentWeek: { year: number; month: number; week: number };
  onSelectMusic: (music: LPMusic) => void;
  onWeekChange: (direction: 'prev' | 'next') => void;
  onDateSelect: (year: number, month: number, week: number) => void;
}

// S:ote 감정별 색상 매핑 (파스텔톤)
const emotionColors: Record<string, string> = {
  '기쁨': '#FFE080',      // 파스텔 노랑
  '슬픔': '#90C8FF',      // 파스텔 파랑
  '분노': '#FFA0A0',      // 파스텔 빨강
  '예민': '#C4B0FF',      // 파스텔 보라
  '무기력': '#C8C8C8',    // 파스텔 회색
};

export function LPWeeklyView({
  musicList,
  currentWeek,
  onSelectMusic,
  onWeekChange,
  onDateSelect,
}: LPWeeklyViewProps) {
  const handlePlayClick = (playUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(playUrl, '_blank');
  };

  // 오름차순 정렬 (오래된 것부터)
  const sortedMusicList = [...musicList].sort(
    (a, b) => new Date(a.rewardDate).getTime() - new Date(b.rewardDate).getTime()
  );

  // 년도 목록 (2020~2025)
  const years = [2020, 2021, 2022, 2023, 2024, 2025];

  // 월 목록
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 주차 목록 (1-5주차)
  const weeks = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-4">
      {/* 주차 네비게이션 */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onWeekChange('prev')}
          className="text-[#4A3228]"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* 통합 날짜 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-[#4A3228]">
              {currentWeek.year}년 {currentWeek.month}월 {currentWeek.week}주차
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="p-2 space-y-2">
              {/* 년도 선택 */}
              <div>
                <p className="text-xs mb-1 px-2" style={{ color: '#4A3228', opacity: 0.6 }}>
                  년도
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {years.map((year) => (
                    <Button
                      key={year}
                      variant={year === currentWeek.year ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8"
                      onClick={() => onDateSelect(year, currentWeek.month, currentWeek.week)}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 월 선택 */}
              <div>
                <p className="text-xs mb-1 px-2" style={{ color: '#4A3228', opacity: 0.6 }}>
                  월
                </p>
                <div className="grid grid-cols-6 gap-1">
                  {months.map((month) => (
                    <Button
                      key={month}
                      variant={month === currentWeek.month ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8"
                      onClick={() => onDateSelect(currentWeek.year, month, currentWeek.week)}
                    >
                      {month}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 주차 선택 */}
              <div>
                <p className="text-xs mb-1 px-2" style={{ color: '#4A3228', opacity: 0.6 }}>
                  주차
                </p>
                <div className="grid grid-cols-5 gap-1">
                  {weeks.map((week) => (
                    <Button
                      key={week}
                      variant={week === currentWeek.week ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8"
                      onClick={() => onDateSelect(currentWeek.year, currentWeek.month, week)}
                    >
                      {week}주
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
          onClick={() => onWeekChange('next')}
          className="text-[#4A3228]"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* LP 리스트 */}
      {sortedMusicList.length === 0 ? (
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
                  {/* LP 디스크 */}
                  <div className="flex-shrink-0">
                    <LPDisc 
                      albumImageUrl={music.albumImageUrl} 
                      title={music.title} 
                      size="md"
                      emotionColor={music.emotionLabel ? emotionColors[music.emotionLabel] || '#7B8B4F' : '#7B8B4F'}
                    />
                  </div>

                  {/* 곡 정보 */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate text-[#4A3228]">{music.title}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handlePlayClick(music.playUrl, e)}
                        className="flex-shrink-0"
                      >
                        <Play className="w-4 h-4" style={{ color: '#7B8B4F' }} />
                      </Button>
                    </div>
                    <p className="text-sm mb-2" style={{ color: '#4A3228', opacity: 0.7 }}>
                      {music.artist}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar
                          className="w-3 h-3"
                          style={{ color: '#7B8B4F', opacity: 0.6 }}
                        />
                        <span className="text-xs" style={{ color: '#4A3228', opacity: 0.6 }}>
                          {new Date(music.rewardDate).toLocaleDateString('ko-KR', {
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      {music.emotionLabel && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: emotionColors[music.emotionLabel] + '20',
                            color: emotionColors[music.emotionLabel] || '#7B8B4F',
                            border: 'none',
                          }}
                        >
                          {music.emotionLabel}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* 추천 이유 */}
                {music.reason && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: '#E5E5E5' }}>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: '#4A3228', opacity: 0.7 }}
                    >
                      💡 {music.reason}
                    </p>
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
