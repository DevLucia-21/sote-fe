import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Headphones } from 'lucide-react';
import { LPWeeklyView } from './lp/LPWeeklyView';
import { LPMonthlyView } from './lp/LPMonthlyView';
import { LPDetailView } from './lp/LPDetailView';
import { LPMusic } from './lp';
import { getMonthWeekDate, getWeekSelection } from '../utils/date';

export function MusicLP() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [selectedMusic, setSelectedMusic] = useState<LPMusic | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const selectedWeek = getWeekSelection(currentDate);
  const currentWeek = {
    year: selectedWeek.year,
    month: selectedWeek.month,
    week: selectedWeek.week,
    start: selectedWeek.start,
    end: selectedWeek.end,
  };

  const currentMonth = {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const boundaryDate = direction === 'next' ? currentWeek.end : currentWeek.start;
    const [year, month, day] = boundaryDate.split('-').map(Number);
    const next = new Date(year, month - 1, day);
    next.setDate(next.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(next);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return next;
    });
  };

  const handleWeekSelect = (year: number, month: number, week: number) => {
    setCurrentDate(getMonthWeekDate(year, month, week));
  };

  const handleMonthSelect = (year: number, month: number) => {
    setCurrentDate(new Date(year, month - 1, 15));
  };

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

      {selectedPeriod === 'week' && (
        <LPWeeklyView
          musicList={[]}
          currentWeek={currentWeek}
          onSelectMusic={setSelectedMusic}
          onWeekChange={handleWeekChange}
          onDateSelect={handleWeekSelect}
        />
      )}

      {selectedPeriod === 'month' && (
        <LPMonthlyView
          musicList={[]}
          currentMonth={currentMonth}
          onSelectMusic={setSelectedMusic}
          onMonthChange={handleMonthChange}
          onDateSelect={handleMonthSelect}
        />
      )}
    </div>
  );
}
