import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar as CalendarIcon, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { mockDiaryData } from './mockData';
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

  const handleSearch = () => {
    setHasSearched(true);
    
    let results = mockDiaryData;

    // 키워드 검색 (이지모드에서는 키워드가 없으므로 내용만 검색)
    if (keyword.trim()) {
      results = results.filter(diary => {
        const keywordLower = keyword.toLowerCase();
        const contentMatch = diary.content?.toLowerCase().includes(keywordLower);
        // 이지모드가 아닐 때만 키워드 매칭 체크
        const keywordsMatch = !isEasyMode && diary.keywords?.some(k => k.toLowerCase().includes(keywordLower));
        return contentMatch || keywordsMatch;
      });
    }

    // 날짜 검색
    if (dateSearch) {
      results = results.filter(diary => diary.date.includes(dateSearch));
    }

    setSearchResults(results);
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
          <DialogDescription className="text-[#4A3228] opacity-60">
            키워드나 날짜로 일기를 검색할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* 검색 입력 */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-[#4A3228] mb-1.5 block">키워드 검색</label>
              <Input
                placeholder="일기 내용이나 키워드 입력..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="border-[#E5E5E5]"
              />
            </div>

            <div>
              <label className="text-sm text-[#4A3228] mb-1.5 block">날짜 검색</label>
              <Input
                type="date"
                value={dateSearch}
                onChange={(e) => setDateSearch(e.target.value)}
                className="border-[#E5E5E5]"
              />
            </div>
          </div>

          {/* 검색 버튼 */}
          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              className="flex-1"
              style={{
                backgroundColor: '#7B8B4F',
                color: '#FFFFFF',
              }}
            >
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="px-4"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 검색 결과 */}
          {hasSearched && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm text-[#4A3228]">
                  검색 결과 {searchResults.length}개
                </h4>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-12 text-[#4A3228] opacity-60">
                  검색 결과가 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((diary, index) => {
                    const emotionLabel = getEmotionLabel(diary.emotion);
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
                          style={{ backgroundColor: '#FFFFFF' }}
                          onClick={() => handleSelectDiary(diary)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" style={{ color: '#7B8B4F' }} />
                              <span className="text-sm" style={{ color: '#7B8B4F' }}>
                                {new Date(diary.date).toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <div
                              className="px-2 py-1 rounded-full text-xs"
                              style={{
                                backgroundColor: color + '20',
                                color: color,
                              }}
                            >
                              {emotionLabel}
                            </div>
                          </div>

                          {/* 키워드 - 이지모드가 아닐 때만 표시 */}
                          {!isEasyMode && diary.keywords && diary.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {diary.keywords.map((kw, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-full text-xs"
                                  style={{
                                    backgroundColor: '#F5F1E8',
                                    color: '#4A3228',
                                  }}
                                >
                                  #{kw}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* 내용 미리보기 */}
                          <p
                            className="text-sm line-clamp-2"
                            style={{ color: '#4A3228', opacity: 0.8 }}
                          >
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