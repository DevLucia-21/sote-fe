import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Search, Play, Square } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { CalendarCell } from '../calendar/CalendarCell';
import { DiaryDetailView } from '../calendar/DiaryDetailView';
import { DiarySearchDialog } from '../calendar/DiarySearchDialog';
import { getDiaryByDate, addDiaryEntry, mockDiaryData } from '../calendar/mockData';
import { getNote } from '../calendar/noteMapping';
import { DiaryEntry, NoteType } from '../calendar/types';
import { DiaryWrite } from '../diary/DiaryWrite';
import { toast } from 'sonner';

interface EasyCalendarViewProps {
  // 사용하지 않음 - Dialog로 직접 처리
}

export function EasyCalendarView({ }: EasyCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempYear, setTempYear] = useState<number | null>(null);
  const [tempMonth, setTempMonth] = useState<number | null>(null);
  const [isWriteDialogOpen, setIsWriteDialogOpen] = useState(false);
  const [editingDiary, setEditingDiary] = useState<DiaryEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const handleYearSelect = (selectedYear: number) => {
    setTempYear(selectedYear);
    
    // 월도 이미 선택되어 있으면 날짜 변경하고 닫기
    if (tempMonth !== null) {
      setCurrentDate(new Date(selectedYear, tempMonth - 1, 15));
      setIsDatePickerOpen(false);
      setTempYear(null);
      setTempMonth(null);
    }
  };

  const handleMonthSelect = (selectedMonth: number) => {
    setTempMonth(selectedMonth);
    
    // 년도도 이미 선택되어 있으면 날짜 변경하고 닫기
    if (tempYear !== null) {
      setCurrentDate(new Date(tempYear, selectedMonth - 1, 15));
      setIsDatePickerOpen(false);
      setTempYear(null);
      setTempMonth(null);
    }
  };

  const handleDatePickerOpenChange = (open: boolean) => {
    setIsDatePickerOpen(open);
    if (!open) {
      // 드롭다운 닫힐 때 임시 선택 초기화
      setTempYear(null);
      setTempMonth(null);
    }
  };

  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getDayKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleCellClick = (date: string) => {
    const diary = getDiaryByDate(date);
    if (diary) {
      setSelectedDiary(diary);
    }
  };

  const handleBack = () => {
    setSelectedDiary(null);
  };

  // 일기 수정 시작
  const handleEdit = () => {
    if (selectedDiary) {
      setEditingDiary(selectedDiary);
      setSelectedDiary(null);
      setIsWriteDialogOpen(true);
    }
  };

  if (selectedDiary) {
    return <DiaryDetailView diary={selectedDiary} onBack={handleBack} onEdit={handleEdit} isEasyMode={true} />;
  }

  // 음계를 주파수로 변환
  const getNoteFrequency = (note: NoteType): number => {
    const frequencies: Record<NoteType, number> = {
      DO: 261.63, RE: 293.66, MI: 329.63, FA: 349.23,
      SOL: 392.00, LA: 440.00, SI: 493.88, HDO: 523.25,
      HRE: 587.33, HMI: 659.25, HFA: 698.46, HSOL: 783.99,
      HLA: 880.00, HSI: 987.77,
    };
    return frequencies[note];
  };

  // 악기별 음색 설정
  const getInstrumentSettings = (instrument: string) => {
    switch (instrument) {
      case 'PIANO': return { type: 'triangle' as OscillatorType, attack: 0.01, decay: 0.3 };
      case 'GUITAR': return { type: 'sawtooth' as OscillatorType, attack: 0.02, decay: 0.4 };
      case 'VIOLIN': return { type: 'sawtooth' as OscillatorType, attack: 0.1, decay: 0.5 };
      case 'FLUTE': return { type: 'sine' as OscillatorType, attack: 0.05, decay: 0.3 };
      case 'MARIMBA': return { type: 'square' as OscillatorType, attack: 0.01, decay: 0.2 };
      default: return { type: 'sine' as OscillatorType, attack: 0.01, decay: 0.3 };
    }
  };

  // 음계 재생 함수
  const playNote = async (frequency: number, duration: number, instrument: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    const settings = getInstrumentSettings(instrument);
    oscillator.type = settings.type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + settings.attack);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);

    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  };

  // 해당 월의 악보 재생
  const playMonthScore = async () => {
    if (isPlaying) return;

    const profileData = localStorage.getItem('profileData');
    let instrument = 'PIANO';
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        instrument = parsed.character || 'PIANO';
      } catch (e) {}
    }

    setIsPlaying(true);
    toast.success(`${month + 1}월의 악보를 재생합니다.`);

    try {
      for (let day = 1; day <= daysInMonth; day++) {
        const dayKey = getDayKey(day);
        const diary = getDiaryByDate(dayKey);
        
        if (diary) {
          const note = getNote(diary.emotion, diary.score);
          const frequency = getNoteFrequency(note);
          await playNote(frequency, 0.5, instrument);
        } else {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      toast.success('재생이 완료되었습니다.');
    } catch (error) {
      toast.error('재생 중 오류가 발생했습니다.');
    } finally {
      setIsPlaying(false);
    }
  };

  // 반응형 음표 크기: 모바일 40, 데스크톱 50
  const noteSize = isMobile ? 40 : 50;

  return (
    <div className="p-6 space-y-6">
      {/* Header - 큰 버튼 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1 md:space-x-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigateMonth('prev')}
            className="text-foreground p-2 md:p-4"
          >
            <ChevronLeft className="w-5 h-5 md:w-7 md:h-7" style={{ transform: "scale(1.6)", transformOrigin: "center" }} />
          </Button>

          {/* 통합 날짜 드롭다운 */}
          <DropdownMenu open={isDatePickerOpen} onOpenChange={handleDatePickerOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-foreground text-lg md:text-2xl px-3 py-4 md:px-6 md:py-6">
                {year}년 {month + 1}월
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <div className="p-3 space-y-3">
                {/* 년도 선택 */}
                <div>
                  <p className="text-base mb-2 px-2 text-muted-foreground">년도</p>
                  <div className="grid grid-cols-3 gap-2">
                    {years.map((y) => (
                      <Button
                        key={y}
                        variant={(tempYear !== null ? tempYear : year) === y ? 'default' : 'ghost'}
                        size="lg"
                        className="h-12 text-base"
                        onClick={() => handleYearSelect(y)}
                      >
                        {y}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 월 선택 */}
                <div>
                  <p className="text-base mb-2 px-2 text-muted-foreground">월</p>
                  <div className="grid grid-cols-6 gap-2">
                    {months.map((m) => (
                      <Button
                        key={m}
                        variant={(tempMonth !== null ? tempMonth : month + 1) === m ? 'default' : 'ghost'}
                        size="lg"
                        className="h-12 text-base"
                        onClick={() => handleMonthSelect(m)}
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
            size="lg"
            onClick={() => navigateMonth('next')}
            className="text-foreground p-2 md:p-4"
          >
            <ChevronRight className="w-5 h-5 md:w-7 md:h-7" style={{ transform: "scale(1.6)", transformOrigin: "center" }} />
          </Button>
        </div>
        <div className="flex items-center -space-x-4">
          <Button 
            variant="ghost" 
            size="lg" 
            className="text-foreground p-3 md:p-4"
            onClick={playMonthScore}
            disabled={isPlaying}
          >
            {isPlaying ? <Square className="w-10 h-10 md:w-16 md:h-16" style={{ transform: "scale(1.8)", transformOrigin: "center" }} /> : <Play className="w-10 h-10 md:w-16 md:h-16" style={{ transform: "scale(1.8)", transformOrigin: "center" }} />}
          </Button>
          <Button 
            variant="ghost" 
            size="lg" 
            className="text-foreground p-3 md:p-4"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-10 h-10 md:w-16 md:h-16" style={{ transform: "scale(1.8)", transformOrigin: "center" }} />
          </Button>
        </div>
      </div>

      {/* Calendar Card */}
      <Card className="bg-card/90 backdrop-blur-sm border-border shadow-md">
        <CardContent className="p-6">
          {/* Weekday Headers - 큰 텍스트 */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div
                key={day}
                className={`text-center text-xl py-3 ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-foreground'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid - 음표 크기 증가 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative grid grid-cols-7"
          >
            {/* Staff lines overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
              {Array.from({ length: Math.ceil((firstDayOfWeek + daysInMonth) / 7) }, (_, rowIndex) => {
                const staffLines = [100, 86, 72, 58, 44];
                return staffLines.map((yPos, lineIndex) => (
                  <div
                    key={`staff-line-${rowIndex}-${lineIndex}`}
                    className="absolute"
                    style={{
                      height: '2px',
                      backgroundColor: 'var(--staff-line-color, #4A3228)',
                      opacity: 'var(--staff-line-opacity, 0.5)',
                      top: `${rowIndex * 160 + yPos}px`,
                      width: '100%',
                      left: 0,
                    }}
                  />
                ));
              })}
            </div>

            {/* Empty cells */}
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <CalendarCell key={`empty-${i}`} isEmpty={true} noteSize={50} cellHeight={160} isEasyMode={true} />
            ))}

            {/* Calendar cells */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayKey = getDayKey(day);
              const diaryEntry = getDiaryByDate(dayKey);
              
              const cellDate = new Date(year, month, day);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPastDate = cellDate < today;

              return (
                <CalendarCell
                  key={day}
                  day={day}
                  diaryEntry={diaryEntry}
                  isPastDate={isPastDate}
                  dateStr={dayKey}
                  onCellClick={handleCellClick}
                  onRestClick={(date) => {
                    // 과거 날짜 쉼표 클릭 시 일기 작성
                    setSelectedDate(date);
                    setEditingDiary(null);
                    setIsWriteDialogOpen(true);
                  }}
                  noteSize={noteSize}
                  cellHeight={160}
                  isEasyMode={true}
                />
              );
            })}
          </motion.div>
        </CardContent>
      </Card>

      {/* 감정별 색상 안내 */}
      <Card className="bg-card/90 backdrop-blur-sm border-border shadow-md">
        <CardContent className="p-6">
          <h3 className="text-xl mb-4 text-foreground">감정별 색상</h3>
          <div className="grid grid-cols-5 gap-3">
            <div className="flex flex-col items-center gap-2">
              <div 
                className={`rounded-full ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}
                style={{ backgroundColor: '#FFD700' }} 
              />
              <span className={`${isMobile ? 'text-sm' : 'text-base'} text-foreground`}>기쁨</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div 
                className={`rounded-full ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}
                style={{ backgroundColor: '#4A90E2' }} 
              />
              <span className={`${isMobile ? 'text-sm' : 'text-base'} text-foreground`}>슬픔</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div 
                className={`rounded-full ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}
                style={{ backgroundColor: '#E74C3C' }} 
              />
              <span className={`${isMobile ? 'text-sm' : 'text-base'} text-foreground`}>분노</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div 
                className={`rounded-full ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}
                style={{ backgroundColor: '#9B59B6' }} 
              />
              <span className={`${isMobile ? 'text-sm' : 'text-base'} text-foreground`}>예민</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div 
                className={`rounded-full ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}
                style={{ backgroundColor: '#95A5A6' }} 
              />
              <span className={`${isMobile ? 'text-sm' : 'text-base'} text-foreground`}>무기력</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Dialog */}
      <DiarySearchDialog 
        open={isSearchOpen} 
        onOpenChange={setIsSearchOpen}
        onSelectDiary={(diary) => {
          setSelectedDiary(diary);
          setIsSearchOpen(false);
        }}
        isEasyMode={true}
      />

      {/* Write Dialog */}
      <Dialog open={isWriteDialogOpen} onOpenChange={setIsWriteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDiary ? '일기 수정' : '일기 작성'}</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <DiaryWrite
            editingDiary={editingDiary}
            date={selectedDate}
            isEasyMode={true}
            editMode={!!editingDiary}
            onSave={(updatedDiary) => {
              // mockData 업데이트 (수정 모드)
              if (editingDiary) {
                const index = mockDiaryData.findIndex(d => d.date === editingDiary.date);
                if (index !== -1) {
                  mockDiaryData[index] = {
                    ...mockDiaryData[index],
                    content: updatedDiary.content || mockDiaryData[index].content,
                    keywords: updatedDiary.keywords || mockDiaryData[index].keywords,
                  };
                }
                toast.success('일기가 수정되었습니다.');
              }
              // 새 일기 작성 모드는 DiaryWrite 내부에서 처리
              setIsWriteDialogOpen(false);
              setEditingDiary(null);
              setSelectedDate(undefined);
            }}
            onBack={() => {
              setIsWriteDialogOpen(false);
              setEditingDiary(null);
              setSelectedDate(undefined);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}