import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar } from '../ui/calendar';
import { Skeleton } from '../ui/skeleton';
import { DiaryCard } from './DiaryCard';
import { KeywordChip } from './KeywordChip';
import { Diary, DiaryFilter } from './types';
import { mockDiaries, mockKeywords, todayDiaryExists } from './mockData';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  BookOpen
} from 'lucide-react';

interface DiaryHomeProps {
  onBack?: () => void;
  onWriteNew?: () => void;
  onViewDetail?: (diary: Diary) => void;
}

export function DiaryHome({ onBack, onWriteNew, onViewDetail }: DiaryHomeProps) {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<DiaryFilter>({ period: 'month' });
  const [selectedKeywords, setSelectedKeywords] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const hasTodayDiary = todayDiaryExists();

  // Filter diaries
  const filteredDiaries = useMemo(() => {
    let result = [...mockDiaries];

    // Filter by keywords
    if (selectedKeywords.length > 0) {
      const selectedKeywordTexts = selectedKeywords
        .map(id => mockKeywords.find(k => k.id === id)?.content)
        .filter(Boolean);
      
      result = result.filter(diary =>
        diary.keywords.some(k => selectedKeywordTexts.includes(k))
      );
    }

    // Filter by search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      result = result.filter(diary =>
        diary.content.toLowerCase().includes(search) ||
        diary.keywords.some(k => k.toLowerCase().includes(search))
      );
    }

    // Sort by date (newest first)
    result.sort((a, b) => b.date.localeCompare(a.date));

    return result;
  }, [selectedKeywords, searchText]);

  // Get diary for selected date
  const selectedDateDiary = useMemo(() => {
    if (!selectedDate) return null;
    const dateStr = selectedDate.toISOString().split('T')[0];
    return mockDiaries.find(d => d.date === dateStr);
  }, [selectedDate]);

  // Toggle keyword filter
  const toggleKeyword = (keywordId: number) => {
    if (selectedKeywords.includes(keywordId)) {
      setSelectedKeywords(selectedKeywords.filter(id => id !== keywordId));
    } else {
      if (selectedKeywords.length >= 3) {
        return; // Max 3 keywords for search
      }
      setSelectedKeywords([...selectedKeywords, keywordId]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedKeywords([]);
    setSearchText('');
  };

  return (
    <div className="min-h-screen p-4 pb-20" style={{ backgroundColor: '#F5F1E8' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="-ml-2 gap-1">
          <ArrowLeft className="w-4 h-4" />
          뒤로
        </Button>
        <h1 className="text-xl" style={{ color: '#4A3228' }}>
          나의 일기
        </h1>
        <div className="w-16" />
      </div>

      {/* Today's Diary CTA */}
      {!hasTodayDiary && (
        <Card className="bg-white mb-4" style={{ borderColor: '#E6E0D6' }}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium mb-1" style={{ color: '#4A3228' }}>
                오늘의 일기를 작성해보세요
              </p>
              <p className="text-sm text-gray-500">
                하루의 감정을, 한 줄의 멜로디로
              </p>
            </div>
            <Button
              onClick={onWriteNew}
              className="text-white"
              style={{ backgroundColor: '#7B8B4F' }}
            >
              <Plus className="w-4 h-4 mr-1" />
              작성하기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters Section */}
      <Card className="bg-white mb-4" style={{ borderColor: '#E6E0D6' }}>
        <CardContent className="p-4 space-y-3">
          {/* Period Toggle */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: '#7B8B4F' }} />
            <Tabs value={filter.period} onValueChange={(v) => setFilter({ ...filter, period: v as any })}>
              <TabsList className="h-8">
                <TabsTrigger value="week" className="text-xs">주간</TabsTrigger>
                <TabsTrigger value="month" className="text-xs">월간</TabsTrigger>
                <TabsTrigger value="custom" className="text-xs">범위</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="내용 또는 키워드 검색..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 border"
              style={{ borderColor: '#E6E0D6' }}
            />
          </div>

          {/* Keyword Filters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm" style={{ color: '#4A3228' }}>
                키워드 필터 ({selectedKeywords.length}/3)
              </p>
              {(selectedKeywords.length > 0 || searchText) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto p-1 text-xs"
                  style={{ color: '#7B8B4F' }}
                >
                  초기화
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {mockKeywords.map((keyword) => (
                <KeywordChip
                  key={keyword.id}
                  keyword={keyword.content}
                  selected={selectedKeywords.includes(keyword.id)}
                  onToggle={() => toggleKeyword(keyword.id)}
                  disabled={
                    !selectedKeywords.includes(keyword.id) &&
                    selectedKeywords.length >= 3
                  }
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {filteredDiaries.length}개의 일기
        </p>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList className="h-8">
            <TabsTrigger value="calendar" className="text-xs gap-1">
              <CalendarIcon className="w-3 h-3" />
              캘린더
            </TabsTrigger>
            <TabsTrigger value="list" className="text-xs gap-1">
              <BookOpen className="w-3 h-3" />
              목록
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white" style={{ borderColor: '#E6E0D6' }}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-20 w-full mb-3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {!loading && viewMode === 'calendar' && (
        <div className="space-y-4">
          <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-lg"
                disabled={(date) => date > new Date()}
              />
            </CardContent>
          </Card>

          {/* Selected Date Diary */}
          {selectedDateDiary ? (
            <div>
              <p className="text-sm mb-2" style={{ color: '#4A3228' }}>
                선택한 날짜의 일기
              </p>
              <DiaryCard
                diary={selectedDateDiary}
                onClick={() => onViewDetail?.(selectedDateDiary)}
              />
            </div>
          ) : selectedDate && (
            <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-3">
                  이 날짜에 작성된 일기가 없습니다
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onWriteNew}
                  style={{ borderColor: '#7B8B4F', color: '#7B8B4F' }}
                >
                  일기 작성하기
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* List View */}
      {!loading && viewMode === 'list' && (
        <div className="space-y-3">
          {filteredDiaries.length === 0 ? (
            <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">
                  {searchText || selectedKeywords.length > 0
                    ? '검색 결과가 없습니다'
                    : '아직 작성된 일기가 없어요'}
                </p>
                <Button
                  onClick={onWriteNew}
                  className="text-white"
                  style={{ backgroundColor: '#7B8B4F' }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  오늘 일기 쓰기
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredDiaries.map((diary) => (
              <DiaryCard
                key={diary.id}
                diary={diary}
                onClick={() => onViewDetail?.(diary)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
