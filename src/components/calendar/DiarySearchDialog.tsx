// 🔥 mockDiaryData 제거, 실제 API 기반 검색 버전
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar as CalendarIcon, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import api from '../../services/api';
import { DiaryEntry } from './types';
import { emotionColors, getEmotionLabel } from './noteMapping';

interface DiarySearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDiary: (diary: DiaryEntry) => void;
  isEasyMode?: boolean;
}

export function DiarySearchDialog({ open, onOpenChange, onSelectDiary, isEasyMode }: DiarySearchDialogProps) {
  const [keyword, setKeyword] = useState('');
  const [dateSearch, setDateSearch] = useState('');
  const [searchResults, setSearchResults] = useState<DiaryEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  /** 🔥 API 기반 검색 함수 */
  const handleSearch = async () => {
    setHasSearched(true);

    try {
      let results: DiaryEntry[] = [];

      // 1) 날짜 검색
      if (dateSearch) {
        const res = await api.get("/api/diaries", {
          params: { date: dateSearch }
        });
        if (res.data) results.push(res.data);
      }

      // 2) 키워드 검색
      if (keyword.trim()) {
        const res = await api.get(`/api/diaries/keyword/search`, {
          params: { keyword }
        });
        if (res.data) results = [...results, ...res.data];
      }

      // 🔥 이지모드에서는 내용 검색 ❌, 키워드로만 검색 ⭕
      if (keyword.trim() && isEasyMode) {
        const k = keyword.toLowerCase();
        results = results.filter((diary) =>
          diary.keywords?.some((kw) => kw.toLowerCase().includes(k))
        );
      }

      // 3) 중복 제거 (날짜 검색 + 키워드 검색이 겹칠 수 있음)
      const unique = Array.from(new Map(results.map(d => [d.date, d])).values());

      setSearchResults(unique);
    } catch (error) {
      console.error("검색 오류:", error);
      setSearchResults([]);
    }
  };

  const handleReset = () => {
    setKeyword('');
    setDateSearch('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleSelectDiary = (diary: DiaryEntry) => {
    onSelectDiary(diary);
    onOpenChange(false);
    handleReset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#4A3228]">
            <Search className="w-5 h-5" />
            일기 검색
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* 검색 입력 */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-[#4A3228] mb-1.5 block">키워드 검색</label>
              <Input
                placeholder="키워드 입력..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="border-[#E5E5E5]"
              />
            </div>

            {/* 날짜 검색 (이지모드에서는 숨김) */}
            {!isEasyMode && (
              <div>
                <label className="text-sm text-[#4A3228] mb-1.5 block">날짜 검색</label>
                <Input
                  type="date"
                  value={dateSearch}
                  onChange={(e) => setDateSearch(e.target.value)}
                  className="border-[#E5E5E5]"
                />
              </div>
            )}
          </div>

          {/* 검색 버튼 */}
          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              className="flex-1"
              style={{ backgroundColor: '#7B8B4F', color: '#FFFFFF' }}
            >
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>

            <Button onClick={handleReset} variant="outline">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 검색 결과 */}
          {hasSearched && (
            <div className="mt-6">
              <h4 className="text-sm text-[#4A3228] mb-3">
                검색 결과 {searchResults.length}개
              </h4>

              {searchResults.length === 0 ? (
                <div className="text-center py-12 text-[#4A3228] opacity-60">
                  검색 결과가 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((diary, index) => {
                    const color = emotionColors[diary.emotion];

                    return (
                      <motion.div
                        key={diary.date}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className="p-4 cursor-pointer hover:shadow-md transition-shadow border-none"
                          onClick={() => handleSelectDiary(diary)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" style={{ color: '#7B8B4F' }} />
                              <span className="text-sm" style={{ color: '#7B8B4F' }}>
                                {new Date(diary.date).toLocaleDateString('ko-KR')}
                              </span>
                            </div>

                            <div
                              className="px-2 py-1 rounded-full text-xs"
                              style={{ backgroundColor: color + '20', color }}
                            >
                              {getEmotionLabel(diary.emotion)}
                            </div>
                          </div>

                          {/* 내용 */}
                          <p className="text-sm line-clamp-2" style={{ color: '#4A3228', opacity: 0.8 }}>
                            {diary.content}
                          </p>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}