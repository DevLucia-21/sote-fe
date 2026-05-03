import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar as CalendarIcon, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import api from '../../services/api';
import { formatDateToAPI } from '../../utils/date';
import { DiaryEntry } from './types';
import { emotionColors, getEmotionLabel } from './noteMapping';

interface DiarySearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDiary: (diary: DiaryEntry) => void;
  isEasyMode?: boolean;
}

type DiaryLike = DiaryEntry & {
  diaryDate?: string;
  title?: string;
  keywords?: Array<string | { content?: string; keyword?: string; name?: string }>;
};

const normalizeDateKey = (diary: DiaryLike) =>
  (diary.date || diary.diaryDate || '').split('T')[0];

const asDiaryList = (data: unknown): DiaryLike[] => {
  if (Array.isArray(data)) return data as DiaryLike[];
  return data ? [data as DiaryLike] : [];
};

const getKeywordTexts = (diary: DiaryLike): string[] => {
  if (!Array.isArray(diary.keywords)) return [];

  return diary.keywords
    .map((keyword) => {
      if (typeof keyword === 'string') return keyword;
      return keyword.content || keyword.keyword || keyword.name || '';
    })
    .filter(Boolean);
};

const matchesEasySearch = (diary: DiaryLike, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return false;

  const content = diary.content?.toLowerCase() || '';
  const title = diary.title?.toLowerCase() || '';
  const keywords = getKeywordTexts(diary).map((keyword) => keyword.toLowerCase());

  return (
    content.includes(normalizedQuery) ||
    title.includes(normalizedQuery) ||
    keywords.some((keyword) => keyword.includes(normalizedQuery))
  );
};

const dedupeByDate = (diaries: DiaryLike[]): DiaryEntry[] => {
  const map = new Map<string, DiaryEntry>();

  diaries.forEach((diary) => {
    const date = normalizeDateKey(diary);
    if (!date) return;
    map.set(date, { ...diary, date } as DiaryEntry);
  });

  return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
};

export function DiarySearchDialog({
  open,
  onOpenChange,
  onSelectDiary,
  isEasyMode = false,
}: DiarySearchDialogProps) {
  const [keyword, setKeyword] = useState('');
  const [dateSearch, setDateSearch] = useState('');
  const [searchResults, setSearchResults] = useState<DiaryEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setHasSearched(true);

    const query = keyword.trim();
    const results: DiaryLike[] = [];

    try {
      if (!isEasyMode && dateSearch) {
        const res = await api.get('/api/diaries', {
          params: { date: dateSearch },
        });
        results.push(...asDiaryList(res.data));
      }

      if (query) {
        try {
          const res = await api.get('/api/diaries/keyword/search', {
            params: { keyword: query },
          });
          results.push(...asDiaryList(res.data));
        } catch (error) {
          console.error('키워드 검색 오류:', error);
        }

        if (isEasyMode) {
          try {
            const res = await api.get('/api/diaries', {
              params: {
                from: '2020-01-01',
                to: formatDateToAPI(new Date()),
              },
            });
            results.push(...asDiaryList(res.data).filter((diary) => matchesEasySearch(diary, query)));
          } catch (error) {
            console.error('일기 내용 검색 오류:', error);
          }
        }
      }

      setSearchResults(dedupeByDate(results));
    } catch (error) {
      console.error('일기 검색 오류:', error);
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
          <div className="space-y-3">
            <div>
              <label className="text-sm text-[#4A3228] mb-1.5 block">
                {isEasyMode ? '일기 내용 또는 키워드 검색' : '키워드 검색'}
              </label>
              <Input
                placeholder={isEasyMode ? '내용이나 키워드를 입력하세요' : '키워드를 입력하세요'}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="border-[#E5E5E5]"
              />
            </div>

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

          {hasSearched && (
            <div className="mt-6">
              <h4 className="text-sm text-[#4A3228] mb-3">
                검색 결과 {searchResults.length}개
              </h4>

              {searchResults.length === 0 ? (
                <div className="text-center py-12 text-[#4A3228] opacity-60">
                  검색 결과가 없어요.
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((diary, index) => {
                    const date = normalizeDateKey(diary);
                    const color = diary.emotion ? emotionColors[diary.emotion] : '#95A5A6';

                    return (
                      <motion.div
                        key={`${date}-${index}`}
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
                                {date ? new Date(date).toLocaleDateString('ko-KR') : '날짜 없음'}
                              </span>
                            </div>

                            <div
                              className="px-2 py-1 rounded-full text-xs"
                              style={{ backgroundColor: `${color}20`, color }}
                            >
                              {diary.emotion ? getEmotionLabel(diary.emotion) : '분석 없음'}
                            </div>
                          </div>

                          <p className="text-sm line-clamp-2" style={{ color: '#4A3228', opacity: 0.8 }}>
                            {diary.content || '작성 내용이 없어요.'}
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
