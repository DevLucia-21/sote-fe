import React, { useState, useEffect } from 'react';
import * as Tone from "tone";
import api from '../services/api';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Search, Settings, Play, Square } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { CalendarCell } from './calendar/CalendarCell';
import { DiaryDetailView } from './calendar/DiaryDetailView';
import { DiarySearchDialog } from './calendar/DiarySearchDialog';
import { emotionColors, getEmotionLabel, getNote } from './calendar/noteMapping';
import { DiaryEntry, NoteType } from './calendar/types';
import { DiaryWrite } from './diary/DiaryWrite';
import { toast } from 'sonner';

interface CalendarViewProps {
  onNavigateToSettings?: () => void;
}

const INSTRUMENT_MAP = {
  piano: "acoustic_grand_piano-mp3",
  violin: "violin-mp3",
  marimba: "marimba-mp3",
  flute: "flute-mp3",
  guitar: "acoustic_guitar_nylon-mp3",
};

const NOTE_MAP = {
  DO: "C4",
  RE: "D4",
  MI: "E4",
  FA: "F4",
  SOL: "G4",
  LA: "A4",
  SI: "B4",
  HDO: "C5",
  HRE: "D5",
  HMI: "E5",
  HFA: "F5",
  HSOL: "G5",
  HLA: "A5",
  HSI: "B5",
};

const SOUNDFONT_BASE =
  "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM";

export function CalendarView({ onNavigateToSettings }: CalendarViewProps) {
  const samplerRef = React.useRef<Tone.Sampler | null>(null);
  const [samplerLoaded, setSamplerLoaded] = useState(false);
  const [monthNotes, setMonthNotes] = useState<Record<string, any>>({});
  const [userCharacter, setUserCharacter] = useState("PIANO");
  const characterToInstrument: Record<string, string> = {
    "PIANO": "piano",
    "VIOLIN": "violin",
    "GUITAR": "guitar",
    "FLUTE": "flute",
    "MARIMBA": "marimba",
  };
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWriteDialogOpen, setIsWriteDialogOpen] = useState(false);
  const [selectedDateForWrite, setSelectedDateForWrite] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [editingDiary, setEditingDiary] = useState<DiaryEntry | null>(null);

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

  const selectDate = (year: number, month: number) => {
    setCurrentDate(new Date(year, month - 1, 15));
  };

  // 년도 목록 (2020~2025)
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  
  // 월 목록
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getDayKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleCellClick = async (date: string) => {
    try {
      // 백엔드에서 해당 날짜의 상세 일기 가져오기
      const res = await api.get(`/api/diaries?date=${date}`);

      if (!res.data) {
        toast.error("해당 날짜의 일기를 찾을 수 없어요.");
        return;
      }

      // 이제 id가 포함된 full diary를 상태에 넣는다
      setSelectedDiary(res.data);

    } catch (err) {
      console.error("❌ 일기 상세 조회 실패:", err);
      toast.error("일기 데이터를 불러오지 못했습니다.");
    }
  };

  const handleBack = () => {
    setSelectedDiary(null);
    setEditMode(false);
    setEditingDiary(null);
  };

  // 일기 수정 시작
  const handleEdit = () => {
    if (selectedDiary) {
      setEditingDiary(selectedDiary);
      setEditMode(true);
      setSelectedDiary(null);
      setSelectedDateForWrite(selectedDiary.date);
      setIsWriteDialogOpen(true);
    }
  };

  // 쉼표 클릭 시 과거 일기 작성
  const handleRestClick = (dateStr: string) => {
    const diary = monthNotes[dateStr];
    if (diary) {
      toast.error('이미 일기가 작성된 날짜입니다.');
      return;
    }
    setSelectedDateForWrite(dateStr);
    setIsWriteDialogOpen(true);
  };

  // 일기 저장 후 처리
  const handleDiarySave = () => {
    setIsWriteDialogOpen(false);
    setSelectedDateForWrite('');
    setEditMode(false);
    setEditingDiary(null);
    // 캘린더를 리렌더링하기 위해 currentDate를 업데이트
    setCurrentDate(new Date(currentDate));
  };

  // 일기 데이터 가져오기
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const currentRes = await api.get(`/api/calendar-notes/${year}/${month + 1}`);

        const prevMonth = month + 1 === 1 ? 12 : month;
        const prevYear = month + 1 === 1 ? year - 1 : year;

        const nextMonth = month + 1 === 12 ? 1 : month + 2;
        const nextYear = month + 1 === 12 ? year + 1 : year;

        const [prevRes, nextRes] = await Promise.all([
          api.get(`/api/calendar-notes/${prevYear}/${prevMonth}`),
          api.get(`/api/calendar-notes/${nextYear}/${nextMonth}`)
        ]);

        const all = [...prevRes.data, ...currentRes.data, ...nextRes.data];

        // 날짜 기반 매핑 생성
        const emotionMap: Record<string, 'JOY' | 'SADNESS' | 'ANGER' | 'APATHY' | 'SENSITIVE'> = {
          '기쁨': 'JOY',
          '슬픔': 'SADNESS',
          '분노': 'ANGER',
          '무기력': 'APATHY',
          '예민': 'SENSITIVE'
        };

        const map: Record<string, any> = {};
        all.forEach((n) => {
          const dateStr = n.date.split("T")[0];
          map[dateStr] = {
            ...n,
            emotion: emotionMap[n.emotionLabel] || 'APATHY',
            contentLength: n.contentLength || 0,
          };
        });

        setMonthNotes(map);
      } catch (e) {
        console.error("월별 일기 불러오기 실패:", e);
      }
    };

    fetchNotes();
  }, [year, month]);

  // 악기 음 샘플 가져오기
  useEffect(() => {
    const loadSampler = async () => {
      try {
        // 1. 프로필 불러오기
        let character = "PIANO";
        try {
          const res = await api.get("/api/users/profile");
          character = res?.data?.character?.toUpperCase() || "PIANO";
        } catch (err) {
          console.error("프로필 불러오기 실패:", err);
        }

        setUserCharacter(character);

        // 2. 캐릭터 → 악기 매핑
        const instrument = (characterToInstrument[character] || "piano").toLowerCase();
        const instPath = INSTRUMENT_MAP[instrument];

        // 3. 샘플러 로드
        const sampler = new Tone.Sampler({
          urls: {
            C4: "C4.mp3",
            D4: "D4.mp3",
            E4: "E4.mp3",
            F4: "F4.mp3",
            G4: "G4.mp3",
            A4: "A4.mp3",
            B4: "B4.mp3",
            C5: "C5.mp3",
            D5: "D5.mp3",
            E5: "E5.mp3",
            F5: "F5.mp3",
            G5: "G5.mp3",
            A5: "A5.mp3",
            B5: "B5.mp3",
          },
          baseUrl: `${SOUNDFONT_BASE}/${instPath}/`,
          onload: () => {
            samplerRef.current = sampler;
            setSamplerLoaded(true);
            console.log("🎵 CalendarView sampler loaded");
          },
        }).toDestination();
      } catch (e) {
        console.error("샘플러 로드 실패:", e);
      }
    };

    loadSampler();
  }, []);

  // 음계를 주파수로 변환
  const getNoteFrequency = (note: NoteType): number => {
    const frequencies: Record<NoteType, number> = {
      DO: 261.63,   // C4
      RE: 293.66,   // D4
      MI: 329.63,   // E4
      FA: 349.23,   // F4
      SOL: 392.00,  // G4
      LA: 440.00,   // A4
      SI: 493.88,   // B4
      HDO: 523.25,  // C5
      HRE: 587.33,  // D5
      HMI: 659.25,  // E5
      HFA: 698.46,  // F5
      HSOL: 783.99, // G5
      HLA: 880.00,  // A5
      HSI: 987.77,  // B5
    };
    return frequencies[note];
  };

  // 악기별 음색 설정
  const getInstrumentSettings = (instrument: string) => {
    switch (instrument) {
      case 'PIANO':
        return { type: 'triangle' as OscillatorType, attack: 0.01, decay: 0.3 };
      case 'GUITAR':
        return { type: 'sawtooth' as OscillatorType, attack: 0.02, decay: 0.4 };
      case 'VIOLIN':
        return { type: 'sawtooth' as OscillatorType, attack: 0.1, decay: 0.5 };
      case 'FLUTE':
        return { type: 'sine' as OscillatorType, attack: 0.05, decay: 0.3 };
      case 'MARIMBA':
        return { type: 'square' as OscillatorType, attack: 0.01, decay: 0.2 };
      default:
        return { type: 'sine' as OscillatorType, attack: 0.01, decay: 0.3 };
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

    // ADSR 엔벨로프
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
    if (!samplerLoaded || !samplerRef.current) {
      toast.error("악기가 아직 로드되지 않았어요!");
      return;
    }

    if (isPlaying) return;

    setIsPlaying(true);
    toast.success(`${month + 1}월 악보를 재생합니다.`);

    const sampler = samplerRef.current;
    const noteDuration = 0.5;
    const gap = 0.1;

    try {
      const now = Tone.now();

      let index = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = getDayKey(day);
        const diary = monthNotes[dateKey];

        if (diary) {
          const note = getNote(diary.emotion, diary.score);
          const midiNote = NOTE_MAP[note];

          if (midiNote) {
            sampler.triggerAttackRelease(
              midiNote,
              noteDuration,
              now + index * (noteDuration + gap)
            );
          }
        }
        index++;
      }
    } catch (err) {
      console.error("재생 오류:", err);
      toast.error("재생 중 오류가 발생했습니다.");
    } finally {
      setTimeout(() => setIsPlaying(false), daysInMonth * (noteDuration + gap) * 1000);
    }
  };

  // Show detail view if diary is selected
  if (selectedDiary) {
    // localStorage에서 사용자 악기 가져오기
    const profileData = localStorage.getItem('profileData');
    let characterType: 'PIANO' | 'GUITAR' | 'VIOLIN' | 'FLUTE' | 'MARIMBA' = 'PIANO';
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        characterType = parsed.character || 'PIANO';
      } catch (e) {
        // 기본값 사용
      }
    }
    
    return <DiaryDetailView diary={selectedDiary} onBack={handleBack} onEdit={handleEdit} characterType={characterType} />;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* 통합 날짜 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-foreground">
                {year}년 {month + 1}월
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
                        className="h-8 text-xs"
                        onClick={() => selectDate(y, month + 1)}
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
                        variant={m === month + 1 ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8"
                        onClick={() => selectDate(year, m)}
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
            onClick={() => navigateMonth('next')}
            className="text-foreground"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-foreground"
            onClick={playMonthScore}
            disabled={isPlaying}
          >
            {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-foreground"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToSettings}
            className="text-foreground"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Card */}
      <Card className="bg-card/90 backdrop-blur-sm border-border shadow-md">
        <CardContent className="p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div
                key={day}
                className={`text-center text-sm py-2 ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-foreground'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative grid grid-cols-7"
          >
            {/* Staff lines overlay for entire grid - 끊김 없이 연결 */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
              {/* Calculate how many rows we need */}
              {Array.from({ length: Math.ceil((firstDayOfWeek + daysInMonth) / 7) }, (_, rowIndex) => {
                const staffLines = [100, 86, 72, 58, 44];
                return staffLines.map((yPos, lineIndex) => (
                  <div
                    key={`staff-line-${rowIndex}-${lineIndex}`}
                    className="absolute"
                    style={{
                      height: '1.5px',
                      backgroundColor: 'var(--staff-line-color, #4A3228)',
                      opacity: 'var(--staff-line-opacity, 0.4)',
                      top: `${rowIndex * 140 + yPos}px`,
                      width: '100%',
                      left: 0,
                    }}
                  />
                ));
              })}
            </div>

            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <CalendarCell key={`empty-${i}`} isEmpty={true} />
            ))}

            {/* Calendar cells for the month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayKey = getDayKey(day);
              const diaryEntry = monthNotes[dayKey];

              // Check if this date is in the past (before today)
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
                  onRestClick={handleRestClick}
                />
              );
            })}
          </motion.div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-card/90 backdrop-blur-sm border-border shadow-md">
        <CardContent className="p-4">
          <h3 className="text-sm text-foreground mb-3">감정 색상</h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {(['JOY', 'SADNESS', 'ANGER', 'APATHY', 'SENSITIVE'] as const).map(emotion => (
              <div key={emotion} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: emotionColors[emotion] }}
                />
                <span className="text-foreground">{getEmotionLabel(emotion)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 검색 다이얼로그 */}
      <DiarySearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectDiary={setSelectedDiary}
      />

      {/* 일기 작성 다이얼로그 */}
      <Dialog open={isWriteDialogOpen} onOpenChange={setIsWriteDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>일기 작성</DialogTitle>
            <DialogDescription>
              과거 날짜의 일기를 작성할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DiaryWrite
            date={selectedDateForWrite}
            onBack={() => setIsWriteDialogOpen(false)}
            onSave={handleDiarySave}
            editMode={editMode}
            editingDiary={editingDiary}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}