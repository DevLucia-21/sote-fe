import React, { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import api from "../../services/api";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Search, Play, Square } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

import { CalendarCell } from "../calendar/CalendarCell";
import { DiaryDetailView } from "../calendar/DiaryDetailView";
import { DiarySearchDialog } from "../calendar/DiarySearchDialog";
import { getNote } from "../calendar/noteMapping";
import { DiaryEntry, NoteType } from "../calendar/types";
import { DiaryWrite } from "../diary/DiaryWrite";
import { toast } from "sonner";
import { hasRewrittenDiaryStatus } from "../../utils/rewrittenDiaryStatus";

/* -----------------------------------------
    악기 사운드 매핑
----------------------------------------- */
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

const normalizeEmotion = (emotion?: string): DiaryEntry["emotion"] => {
  const emotionMap: Record<string, DiaryEntry["emotion"]> = {
    JOY: "JOY",
    SADNESS: "SADNESS",
    ANGER: "ANGER",
    APATHY: "APATHY",
    SENSITIVE: "SENSITIVE",
    "기쁨": "JOY",
    "슬픔": "SADNESS",
    "분노": "ANGER",
    "화남": "ANGER",
    "무기력": "APATHY",
    "예민": "SENSITIVE",
  };

  return emotion ? emotionMap[emotion] || "APATHY" : "APATHY";
};

const getCalendarNoteList = (data: any): DiaryEntry[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.notes)) return data.notes;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const SOUNDFONT_BASE =
  "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM";

export function EasyCalendarView() {
  /* -----------------------------------------
      상태값
  ----------------------------------------- */
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const [samplerLoaded, setSamplerLoaded] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthDiaries, setMonthDiaries] = useState<Record<string, DiaryEntry>>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null);
  const [editingDiary, setEditingDiary] = useState<DiaryEntry | null>(null);
  const [isWriteDialogOpen, setIsWriteDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  );

  const [isMobile, setIsMobile] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempYear, setTempYear] = useState<number | null>(null);
  const [tempMonth, setTempMonth] = useState<number | null>(null);

  const years = Array.from(
    { length: new Date().getFullYear() - 2019 },
    (_, index) => 2020 + index,
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  /* -----------------------------------------
      월간 일기 로드
  ----------------------------------------- */
  const loadMonthDiaries = async () => {
    try {
      setLoading(true);
      const y = currentDate.getFullYear();
      const m = currentDate.getMonth() + 1;
      const monthStart = `${y}-${String(m).padStart(2, "0")}-01`;
      const monthEnd = `${y}-${String(m).padStart(2, "0")}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;

      const currentRes = await api.get(`/api/calendar-notes/${y}/${m}`);

      const prevMonth = m === 1 ? 12 : m - 1;
      const prevYear = m === 1 ? y - 1 : y;

      const nextMonth = m === 12 ? 1 : m + 1;
      const nextYear = m === 12 ? y + 1 : y;

      const [prevRes, nextRes, monthDiariesRes] = await Promise.all([
        api.get(`/api/calendar-notes/${prevYear}/${prevMonth}`),
        api.get(`/api/calendar-notes/${nextYear}/${nextMonth}`),
        api.get("/api/diaries", { params: { from: monthStart, to: monthEnd } }),
      ]);

      const all = [
        ...getCalendarNoteList(prevRes.data),
        ...getCalendarNoteList(currentRes.data),
        ...getCalendarNoteList(nextRes.data),
      ];

      const emotionMap = {
        "기쁨": "JOY",
        "슬픔": "SADNESS",
        "분노": "ANGER",
        "화남": "ANGER",
        "무기력": "APATHY",
        "예민": "SENSITIVE",
      };

      const map: Record<string, DiaryEntry> = {};
      all.forEach((d: DiaryEntry) => {
        const dateStr = d.date.split("T")[0];
        map[dateStr] = {
          ...d,
          emotion: normalizeEmotion(d.emotionLabel || (d as any).emotionType || (d as any).emotion),
          contentLength: d.contentLength || 0,
          analysisDisabled: hasRewrittenDiaryStatus(dateStr) || (d as any).analysisDisabled,
        };
      });

      const monthDiaries = Array.isArray(monthDiariesRes.data) ? monthDiariesRes.data : [];
      monthDiaries.forEach((diary: any) => {
        const normalizedDiary = normalizeDiary(diary);
        const dateStr = normalizedDiary.date;
        if (!dateStr) return;

        map[dateStr] = {
          ...map[dateStr],
          ...normalizedDiary,
          analysisDisabled:
            hasRewrittenDiaryStatus(dateStr) ||
            normalizedDiary.analysisDisabled ||
            !map[dateStr],
        };
      });

      setMonthDiaries(map);
    } catch (e) {
      toast.error("일기를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonthDiaries();
  }, [currentDate]);

  /* -----------------------------------------
      반응형 체크
  ----------------------------------------- */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* -----------------------------------------
      음표 재생을 위한 Sampler 로드
  ----------------------------------------- */
  useEffect(() => {
    const loadSampler = async () => {
      try {
        let character = "PIANO";

        try {
          const res = await api.get("/api/users/profile");
          const profile = res.data;
          character = profile.character?.toUpperCase() || "PIANO";

          localStorage.setItem("profileData", JSON.stringify(profile));
        } catch (e) {
          console.error("프로필 불러오기 실패:", e);
        }

        const inst = character.toLowerCase();
        const instPath =
          INSTRUMENT_MAP[inst as keyof typeof INSTRUMENT_MAP] ||
          INSTRUMENT_MAP.piano;

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
          },
        }).toDestination();
      } catch (e) {
        console.error("Sampler load error:", e);
      }
    };

    loadSampler();
  }, []);

  /* -----------------------------------------
      날짜 key
  ----------------------------------------- */
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const getDayKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;

  const normalizeDiary = (diary: any, fallbackDate?: string): DiaryEntry => {
    const date = diary.date || diary.diaryDate || fallbackDate || "";
    const normalizedDate = date.split("T")[0];

    return {
      ...diary,
      date: normalizedDate,
      emotion: normalizeEmotion(diary.emotionLabel || diary.emotionType || diary.emotion),
      contentLength: diary.contentLength || diary.content?.length || 0,
      analysisDisabled: hasRewrittenDiaryStatus(normalizedDate) || diary.analysisDisabled,
    };
  };

  const fetchDiaryByDate = async (dateStr: string) => {
    const rangeRes = await api.get("/api/diaries", {
      params: { from: dateStr, to: dateStr },
    });

    if (Array.isArray(rangeRes.data)) {
      return rangeRes.data.find((diary) => {
        const diaryDate = (diary.date || diary.diaryDate || "").split("T")[0];
        return diaryDate === dateStr;
      });
    }

    return rangeRes.data;
  };

  /* -----------------------------------------
      날짜 이동
  ----------------------------------------- */
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return d;
    });
  };

  /* -----------------------------------------
      날짜 선택 드롭다운
  ----------------------------------------- */
  const handleYearSelect = (y: number) => {
    setTempYear(y);
    if (tempMonth !== null) {
      setCurrentDate(new Date(y, tempMonth - 1, 15));
      setIsDatePickerOpen(false);
      setTempYear(null);
      setTempMonth(null);
    }
  };
  const handleMonthSelect = (m: number) => {
    setTempMonth(m);
    if (tempYear !== null) {
      setCurrentDate(new Date(tempYear, m - 1, 15));
      setIsDatePickerOpen(false);
      setTempYear(null);
      setTempMonth(null);
    }
  };

  /* -----------------------------------------
      셀 클릭 → 일기 상세
  ----------------------------------------- */
  const handleCellClick = async (dateStr: string) => {
    const res = await api.get(`/api/diaries?date=${dateStr}`);

    const diary = res.data;

    const emotionMap = {
      "기쁨": "JOY",
      "슬픔": "SADNESS",
      "분노": "ANGER",
      "화남": "ANGER",
      "무기력": "APATHY",
      "예민": "SENSITIVE",
    };

    const finalDiary = {
      ...diary,
      emotion: normalizeEmotion(diary.emotionLabel || diary.emotionType || diary.emotion),
      date: diary.date.split("T")[0],
    };

    setSelectedDiary(normalizeDiary(diary, dateStr));
  };

  /* -----------------------------------------
      일기 작성/수정
  ----------------------------------------- */
  const handleRestClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setEditingDiary(null);
    setIsWriteDialogOpen(true);
  };

  const handleDiarySave = async (savedDiary?: any) => {
    const savedDate = editingDiary?.date || selectedDate;

    setIsWriteDialogOpen(false);
    setEditingDiary(null);
    setSelectedDate(undefined);
    await loadMonthDiaries();

    if (!savedDate) return;

    const fallbackDiary = savedDiary
      ? normalizeDiary(savedDiary, savedDate)
      : null;

    if (fallbackDiary) {
      setMonthDiaries((prev) => ({
        ...prev,
        [savedDate]: {
          ...prev[savedDate],
          ...fallbackDiary,
          analysisDisabled: fallbackDiary.analysisDisabled,
        },
      }));
    }

    try {
      const latestDiary = await fetchDiaryByDate(savedDate);
      const detailDiary = latestDiary ?? fallbackDiary;
      if (detailDiary) {
        setSelectedDiary(normalizeDiary({
          ...detailDiary,
          analysisDisabled: fallbackDiary?.analysisDisabled || (detailDiary as any).analysisDisabled,
        }, savedDate));
      }
    } catch (error) {
      if (fallbackDiary) {
        setSelectedDiary(fallbackDiary);
        return;
      }

      console.error("저장된 일기 상세 재조회 실패:", error);
      toast.error("저장된 일기를 다시 불러오지 못했습니다.");
    }
  };

  /* -----------------------------------------
      음표 재생
  ----------------------------------------- */
  const playMonthScore = async () => {
    if (isPlaying) return;
    if (!samplerLoaded || !samplerRef.current) {
      toast.error("악기를 아직 불러오는 중이에요!");
      return;
    }

    setIsPlaying(true);
    toast.success(`${month + 1}월 악보를 재생합니다.`);

    const sampler = samplerRef.current;
    const noteDuration = 0.5;
    const gap = 0.1;
    const now = Tone.now();

    let index = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = getDayKey(day);
      const diary = monthDiaries[dayKey];
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

    setTimeout(
      () => setIsPlaying(false),
      daysInMonth * (noteDuration + gap) * 1000
    );
  };

  /* -----------------------------------------
      선택된 일기 상세 보기
  ----------------------------------------- */
  if (selectedDiary) {
    return (
      <DiaryDetailView
        diary={selectedDiary}
        onBack={() => setSelectedDiary(null)}
        onEdit={() => {
          setEditingDiary(selectedDiary);
          setSelectedDate(selectedDiary.date);
          setSelectedDiary(null);
          setIsWriteDialogOpen(true);
        }}
        isEasyMode
      />
    );
  }

  const noteSize = isMobile ? 40 : 50;

  /* -----------------------------------------
      렌더링
  ----------------------------------------- */
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigateMonth("prev")}
          >
            <ChevronLeft className="w-7 h-7" style={{ transform: "scale(1.6)", transformOrigin: "center" }} />
          </Button>

          <DropdownMenu
            open={isDatePickerOpen}
            onOpenChange={setIsDatePickerOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-2xl px-6 py-4">
                {year}년 {month + 1}월
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-64">
              <div className="p-3 space-y-3">
                {/* 년도 선택 */}
                <div>
                  <p className="text-base px-2 mb-1 text-muted-foreground">
                    년도
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {years.map((y) => (
                      <Button
                        key={y}
                        variant={
                          (tempYear ?? year) === y ? "default" : "ghost"
                        }
                        onClick={() => handleYearSelect(y)}
                      >
                        {y}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 월 선택 */}
                <div>
                  <p className="text-base px-2 mb-1 text-muted-foreground">
                    월
                  </p>
                  <div className="grid grid-cols-6 gap-1">
                    {months.map((m) => (
                      <Button
                        key={m}
                        variant={
                          (tempMonth ?? month + 1) === m ? "default" : "ghost"
                        }
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
            onClick={() => navigateMonth("next")}
          >
            <ChevronRight className="w-7 h-7" style={{ transform: "scale(1.6)", transformOrigin: "center" }} />
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="lg" onClick={playMonthScore}>
            {isPlaying ? <Square className="w-10 h-10 md:w-16 md:h-16" style={{ transform: "scale(1.8)", transformOrigin: "center" }} /> : <Play className="w-10 h-10 md:w-16 md:h-16" style={{ transform: "scale(1.8)", transformOrigin: "center" }} />}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-10 h-10 md:w-16 md:h-16" style={{ transform: "scale(1.8)", transformOrigin: "center" }} />
          </Button>
        </div>
      </div>

      {/* CALENDAR CARD */}
      <Card>
        <CardContent className="p-6">
          {/* 요일 */}
          <div className="grid grid-cols-7 mb-4 text-xl text-center">
            {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
              <div
                key={d}
                className={
                  i === 0
                    ? "text-red-500"
                    : i === 6
                    ? "text-blue-500"
                    : "text-foreground"
                }
              >
                {d}
              </div>
            ))}
          </div>

          {/* 달력 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-7 relative"
          >
            {/* Staff line overlay */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {Array.from(
                {
                  length: Math.ceil((firstDayOfWeek + daysInMonth) / 7),
                },
                (_, rowIndex) => {
                  const staffLines = [100, 86, 72, 58, 44];
                  return staffLines.map((y, i) => (
                    <div
                      key={`${rowIndex}-${i}`}
                      className="absolute"
                      style={{
                        height: "2px",
                        opacity: 0.5,
                        backgroundColor: "#4A3228",
                        top: `${rowIndex * 160 + y}px`,
                        width: "100%",
                      }}
                    />
                  ));
                }
              )}
            </div>

            {/* 빈 칸 */}
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <CalendarCell key={`e-${i}`} isEmpty noteSize={noteSize} />
            ))}

            {/* 날짜 칸 */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const key = getDayKey(day);
              const diary = monthDiaries[key];
              const dateObj = new Date(key);

              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const isPast = dateObj < today;

              if (diary) {
                const note = diary.analysisDisabled ? null : getNote(diary.emotion, diary.score);
              }

              return (
                <CalendarCell
                  key={key}
                  day={day}
                  diaryEntry={diary}
                  isPastDate={isPast}
                  dateStr={key}
                  onCellClick={handleCellClick}
                  onRestClick={handleRestClick}
                  noteSize={noteSize}
                  cellHeight={160}
                  isEasyMode
                />
              );
            })}
          </motion.div>
        </CardContent>
      </Card>

      {/* 감정 색상 안내 */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg mb-3">감정 색상</h3>
          <div className="grid grid-cols-5 gap-3 text-center">
            {[
              ["#FFD700", "기쁨"],
              ["#4A90E2", "슬픔"],
              ["#E74C3C", "화남"],
              ["#9B59B6", "예민"],
              ["#95A5A6", "무기력"],
            ].map(([color, label]) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  className={`rounded-full ${
                    isMobile ? "w-8 h-8" : "w-12 h-12"
                  }`}
                  style={{ backgroundColor: color }}
                ></div>
                <span
                  className={`${isMobile ? "text-sm" : "text-base"} text-foreground`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 검색 */}
      <DiarySearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectDiary={(d) => {
          const dateStr = (d.date || (d as any).diaryDate || '').split("T")[0];
          setSelectedDiary(normalizeDiary(d, dateStr));
          setIsSearchOpen(false);
        }}
        isEasyMode
      />

      {/* 일기 작성/수정 */}
      <Dialog open={isWriteDialogOpen} onOpenChange={setIsWriteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDiary ? "일기 수정" : "일기 작성"}
            </DialogTitle>
          </DialogHeader>

          <DiaryWrite
            date={selectedDate}
            editingDiary={editingDiary}
            editMode={!!editingDiary}
            isEasyMode
            onBack={() => {
              setIsWriteDialogOpen(false);
              setEditingDiary(null);
            }}
            onSave={() => handleDiarySave()}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
