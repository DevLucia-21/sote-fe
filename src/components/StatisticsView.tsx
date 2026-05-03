import React, { useState, useEffect } from 'react';
import * as Tone from "tone";
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { MonthlyAnswers } from './questions/MonthlyAnswers';
import { NoteHead } from './calendar/NoteHead';
import { HealthStatsTab } from './statistics/HealthStatsTab';
import { WatchPairingView } from './settings/WatchPairingView';
import {
  formatYearMonth,
  getMonthWeekDate,
  getWeekDateList,
  getWeekSelection,
} from '../utils/date';
import { 
  Music, 
  TrendingUp, 
  Target, 
  Smile,
  Frown,
  Heart,
  Meh,
  Angry,
  Star,
  Play,
  Pause,
  MessageCircleQuestion,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
  Hash,
  Headphones,
  Activity,
  Sparkles,
  Trophy
} from 'lucide-react';

// ========== API Response Types ==========

interface CalendarNoteDto {
  date: string;
  note: string;
  emotionLabel: 'JOY' | 'SADNESS' | 'ANGER' | 'APATHY' | 'SENSITIVE';
  score: number;
}

interface ChallengeCompletionResponse {
  totalChallenges: number;
  completedChallenges: number;
  completionRate: number;
}

interface MusicStatsResponse {
  monthlyCount: number;
  emotionGenreMapping: Record<string, Record<string, number>>;
}

interface DiaryStatsResponse {
  totalCount: number;
  monthlyCount: number;
}

interface MoodRankingItem {
  keyword: string;
  icon: string;
  count: number;
}

interface MoodRankingResponse {
  joyKeywords: MoodRankingItem[];
  angerKeywords: MoodRankingItem[];
}

function normalize(dateStr: string) {
  // dateStr이 "2025-11-10" 또는 "2025-11-10T14:00:00" 모두 지원
  const [y, m, d] = dateStr.split("T")[0].split("-");
  return `${y}-${m}-${d}`;
}

// ========== Mapping Constants ==========

const emotionIcons = {
  JOY: Smile,
  SADNESS: Frown,
  ANGER: Angry,
  SENSITIVE: Meh,
  APATHY: Heart
};

const emotionNames = {
  JOY: '기쁨',
  SADNESS: '슬픔',
  ANGER: '분노',
  SENSITIVE: '예민',
  APATHY: '무기력'
};

const emotionMap: Record<string, 'JOY' | 'SADNESS' | 'ANGER' | 'APATHY' | 'SENSITIVE'> = {
  '기쁨': 'JOY',
  '슬픔': 'SADNESS',
  '분노': 'ANGER',
  '화남': 'ANGER',
  '예민': 'SENSITIVE',
  '무기력': 'APATHY',

  // 영어 감정도 지원하도록 추가
  'JOY': 'JOY',
  'SADNESS': 'SADNESS',
  'ANGER': 'ANGER',
  'SENSITIVE': 'SENSITIVE',
  'APATHY': 'APATHY',
};

const normalizeMusicStatsResponse = (payload: any): MusicStatsResponse | null => {
  const emotionGenreMapping = payload?.emotionGenreMapping ?? {};
  const hasRecommendations = Object.values(emotionGenreMapping).some((genres: any) =>
    Object.values(genres ?? {}).some((count) => Number(count) > 0)
  );

  if (!hasRecommendations) return null;

  return {
    monthlyCount: Number(payload?.monthlyCount ?? 0),
    emotionGenreMapping,
  };
};

const getEmotionDisplayLabel = (emotionKey: string): string => {
  const emotion = emotionMap[emotionKey];
  return emotion ? emotionNames[emotion] : emotionKey;
};

const getTopGenre = (emotionGenreMapping: Record<string, Record<string, number>>): string | null => {
  const genreTotals: Record<string, number> = {};

  Object.values(emotionGenreMapping).forEach((genres) => {
    Object.entries(genres ?? {}).forEach(([genre, count]) => {
      const numericCount = Number(count);
      if (numericCount <= 0) return;
      genreTotals[genre] = (genreTotals[genre] ?? 0) + numericCount;
    });
  });

  const top = Object.entries(genreTotals).sort((a, b) => b[1] - a[1])[0];
  return top?.[0] ?? null;
};

const emotionColorClasses = {
  JOY: { text: 'text-amber-600', bg: 'bg-amber-50', bar: '#FFE080' },
  SADNESS: { text: 'text-blue-500', bg: 'bg-amber-50', bar: '#90C8FF' },
  ANGER: { text: 'text-red-500', bg: 'bg-amber-50', bar: '#FFA0A0' },
  SENSITIVE: { text: 'text-purple-500', bg: 'bg-amber-50', bar: '#C4B0FF' },
  APATHY: { text: 'text-gray-600', bg: 'bg-amber-50', bar: '#C8C8C8' }
};

const dayOfWeekNames = ['일', '월', '화', '수', '목', '금', '토'];

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

export function StatisticsView() {
  const samplerRef = React.useRef<Tone.Sampler | null>(null);
  const [samplerLoaded, setSamplerLoaded] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'emotion' | 'health'>('emotion');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'total'>('week');
  const [isPlaying, setIsPlaying] = useState(false);
  const isDarkMode =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  
  const today = new Date();
  const [currentWeek, setCurrentWeek] = useState({
    baseDate: today   // 기준 날짜(어떤 날짜든 상관 없음)
  });
  const [currentMonth, setCurrentMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1
  });
  
  // 건강 데이터 연동 여부 확인
  // const isHealthConnected = 'true';
  const isHealthConnected = localStorage.getItem('healthDataConnected') === 'true';
  const [showPairing, setShowPairing] = useState(false);

  console.log("🔥 [StatisticsView] selectedTab =", selectedTab);
  console.log("🔥 [StatisticsView] showPairing =", showPairing);

  const characterToInstrument: Record<string, string> = {
    "PIANO": "piano",
    "VIOLIN": "violin",
    "GUITAR": "guitar",
    "FLUTE": "flute",
    "MARIMBA": "marimba",
  };

  // ========== Data States ==========
  // 주간
  const [weeklyNotes, setWeeklyNotes] = useState<CalendarNoteDto[]>([]);
  const [weeklyChallengeStats, setWeeklyChallengeStats] = useState<ChallengeCompletionResponse | null>(null);
  const base = currentWeek.baseDate;
  const selectedWeek = getWeekSelection(base);
  const { year, month, week } = selectedWeek;
  const [userCharacter, setUserCharacter] = useState("PIANO");
  const emotionMapKoToEn: Record<string, 'JOY' | 'SADNESS' | 'ANGER' | 'APATHY' | 'SENSITIVE'> = {
    '기쁨': 'JOY',
    '슬픔': 'SADNESS',
    '분노': 'ANGER',
    '화남': 'ANGER',
    '무기력': 'APATHY',
    '예민': 'SENSITIVE',
  };
  const [weeklyContentLengths, setWeeklyContentLengths] = useState<Record<string, number>>({});

  // 월간
  const [monthlyDiaryStats, setMonthlyDiaryStats] = useState<DiaryStatsResponse | null>(null);
  const [monthlyEmotionDistribution, setMonthlyEmotionDistribution] = useState<Record<string, number>>({});
  const [monthlyChallengePerformance, setMonthlyChallengePerformance] = useState<Record<string, { completed: number; total: number }>>({});
  const [monthlyMusicStats, setMonthlyMusicStats] = useState<MusicStatsResponse | null>(null);
  const [monthlyKeywords, setMonthlyKeywords] = useState<Array<{ keyword: string; count: number }>>([]);

  // 누적
  const [totalDiaryCount, setTotalDiaryCount] = useState(0);
  const [totalBadgeCount, setTotalBadgeCount] = useState(0);
  const [totalEmotionDistribution, setTotalEmotionDistribution] = useState<Record<string, number>>({});
  const [moodRanking, setMoodRanking] = useState<MoodRankingResponse | null>(null);
  const [totalKeywordMapping, setTotalKeywordMapping] = useState<Array<{ keyword: string; emotions: Record<string, number> }>>([]);
  const [showMonthlyAnswers, setShowMonthlyAnswers] = useState(false);

  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  const [isLoadingTotal, setIsLoadingTotal] = useState(false);

  // ========== Handlers ==========
  const handleWeekChange = (direction: 'prev' | 'next') => {
    const boundaryDate = direction === 'next' ? selectedWeek.end : selectedWeek.start;
    const [boundaryYear, boundaryMonth, boundaryDay] = boundaryDate.split('-').map(Number);
    const baseDate = new Date(boundaryYear, boundaryMonth - 1, boundaryDay);
    baseDate.setDate(baseDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentWeek({ baseDate });
  };

  const handleWeekDateSelect = (year: number, month: number, week: number) => {
    setCurrentWeek({ baseDate: getMonthWeekDate(year, month, week) });
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      let newYear = prev.year;
      let newMonth = direction === 'next' ? prev.month + 1 : prev.month - 1;

      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }

      return { year: newYear, month: newMonth };
    });
  };

  const handleMonthDateSelect = (year: number, month: number) => {
    setCurrentMonth({ year, month });
  };

  // ========== Fetch Weekly Data ==========
  useEffect(() => {
    setCurrentMonth((prev) =>
      prev.year === selectedWeek.year && prev.month === selectedWeek.month
        ? prev
        : { year: selectedWeek.year, month: selectedWeek.month },
    );
  }, [selectedWeek.year, selectedWeek.month]);

  useEffect(() => {
    const loadContentLengths = async () => {
      const results: Record<string, number> = {};

      for (const note of weeklyNotes) {
        const dateStr = normalize(note.date);

        try {
          const res = await api.get("/api/diaries", {
            params: { from: dateStr, to: dateStr },
          });
          const diary = Array.isArray(res.data)
            ? res.data.find((item: any) => normalize(item.date || item.diaryDate || '') === dateStr)
            : res.data;
          results[dateStr] = diary?.content?.length ?? 0;
        } catch {
          results[dateStr] = 0;
        }
      }

      setWeeklyContentLengths(results);
    };

    if (weeklyNotes.length > 0) {
      loadContentLengths();
    }
  }, [weeklyNotes]);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      console.log("🌙 baseDate =", currentWeek.baseDate);
      console.log("📅 fetch with year/month =", year, month);
      setIsLoadingWeekly(true);
      try {
        const base = currentWeek.baseDate;
        const weekDates = getWeekDateList(base);
        const weekMonths = Array.from(
          new Set(weekDates.map((date) => date.slice(0, 7))),
        ).map((yearMonth) => {
          const [year, month] = yearMonth.split('-').map(Number);
          return { year, month };
        });

        const noteResponses = await Promise.all(
          weekMonths.map(({ year, month }) => api.get(`/api/calendar-notes/${year}/${month}`)),
        );
        const monthNotes: CalendarNoteDto[] = noteResponses.flatMap((response) => {
          const raw = response.data;
          return Array.isArray(raw) ? raw : raw?.notes ?? [];
        });

        const weeklyFiltered = monthNotes.filter((note) => {
          const noteDate = normalize(note.date);
          return (
            weekDates.includes(noteDate) &&
            noteDate >= selectedWeek.start &&
            noteDate <= selectedWeek.end
          );
        });

        const normalizedWeeklyNotes = weeklyFiltered.map(n => {
          const normalizedEmotion =
            emotionMapKoToEn[n.emotionLabel] || 'APATHY';

          return {
            ...n,
            emotion: normalizedEmotion,
            emotionLabel: normalizedEmotion,
            contentLength: n.contentLength || 0,
          };
        });

        setWeeklyNotes(normalizedWeeklyNotes);

        const fetchUserProfile = async () => {
          const res = await api.get("/api/users/profile");
          return res.data; // { character: "MARIMBA", ... }
        };

        const loadProfile = async () => {
          try {
            const profile = await fetchUserProfile();
            setUserCharacter(profile.character?.toUpperCase() || "PIANO");
          } catch (e) {
            console.error("프로필 불러오기 실패:", e);
          }
        };
        loadProfile();

        const challenge = await api.get("/api/statistics/challenges/completion-rate", {
          params: {
            period: "weekly",
            startDate: selectedWeek.start,
            endDate: selectedWeek.end,
          }
        });
        setWeeklyChallengeStats(challenge.data);
      } catch (error) {
        console.error("주간 데이터 로딩 실패:", error);
      } finally {
        setIsLoadingWeekly(false);
      }
    };

    fetchWeeklyData();
  }, [currentWeek.baseDate, selectedWeek.start, selectedWeek.end]);

  // ========== Fetch Monthly Data ==========
  useEffect(() => {
    let cancelled = false;

    const fetchMonthlyData = async () => {
      setIsLoadingMonthly(true);
      setMonthlyMusicStats(null);
      try {
        const monthKey = formatYearMonth(currentMonth.year, currentMonth.month);
        const [diary, challengeEmotion, music, keywordRank] = await Promise.allSettled([
          api.get("/api/statistics/diary", {
            params: {
              period: "monthly",
              year: currentMonth.year,
              month: currentMonth.month,
            }
          }).catch(() => api.get("/api/statistics/diary", {
            params: {
              period: "monthly",
              month: monthKey,
            }
          })),
          api.get("/api/statistics/challenges/emotion-performance", {
            params: {
              period: "monthly",
              month: monthKey,
            }
          }),
          api.get("/api/statistics/music", {
            params: {
              period: "monthly",
              year: currentMonth.year,
              month: currentMonth.month,
            }
          }),
          api.get("/api/statistics/keywords/ranking", {
            params: {
              period: "monthly",
              year: currentMonth.year,
              month: currentMonth.month,
            }
          }).catch(() => api.get("/api/statistics/keywords/ranking", {
            params: {
              period: "monthly",
              month: monthKey,
            }
          })),
        ]);

        if (cancelled) return;

        const monthlyDiaryCount =
          diary.status === "fulfilled"
            ? diary.value.data?.monthlyCount ?? diary.value.data?.count ?? 0
            : 0;
        const hasMonthlyDiary = monthlyDiaryCount > 0;

        if (diary.status === "fulfilled") {
          setMonthlyDiaryStats({
            ...diary.value.data,
            monthlyCount: monthlyDiaryCount,
          });
        } else {
          console.error("월간 일기 통계 로딩 실패:", diary.reason);
          setMonthlyDiaryStats(null);
        }

        if (!hasMonthlyDiary) {
          setMonthlyChallengePerformance({});
          setMonthlyMusicStats(null);
          setMonthlyKeywords([]);
          return;
        }

        if (challengeEmotion.status === "fulfilled") {
          const ce = challengeEmotion.value.data;
          const mergedPerformance: Record<string, { completed: number; total: number }> = {};
          Object.keys(ce.emotionCounts ?? {}).forEach(emotion => {
            mergedPerformance[emotion] = {
              completed: ce.emotionCounts[emotion] ?? 0,
              total: ce.totalCounts?.[emotion] ?? 0
            };
          });
          setMonthlyChallengePerformance(mergedPerformance);
        } else {
          console.error("월간 챌린지 감정별 수행 현황 로딩 실패:", challengeEmotion.reason);
          setMonthlyChallengePerformance({});
        }

        if (music.status === "fulfilled") {
          setMonthlyMusicStats(normalizeMusicStatsResponse(music.value.data));
        } else {
          console.error("월간 음악 통계 로딩 실패:", music.reason);
          setMonthlyMusicStats(null);
        }

        if (keywordRank.status === "fulfilled") {
          setMonthlyKeywords(keywordRank.value.data.rankings ?? []);
        } else {
          console.error("월간 키워드 랭킹 로딩 실패:", keywordRank.reason);
          setMonthlyKeywords([]);
        }

      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setIsLoadingMonthly(false);
        }
      }
    };

    fetchMonthlyData();

    return () => {
      cancelled = true;
    };
  }, [currentMonth.year, currentMonth.month]);

  // ========== Fetch Total Data ==========
  useEffect(() => {
    const fetchTotalData = async () => {
      setIsLoadingTotal(true);
      try {
        const [diary, analysis, badges, mood, keywordExplore] = await Promise.allSettled([
          api.get("/api/statistics/diary", { params: { period: "overall" }}),
          api.get("/api/statistics/analysis", { params: { period: "overall" }}),
          api.get("/api/statistics/challenges/badges", { params: { period: "overall" }}),
          api.get("/api/statistics/keywords/emotion-ranking", { params: { period: "overall" }}),
          api.get("/api/statistics/keywords/explore", { params: { period: "overall" }}),
        ]);

        if (diary.status === "fulfilled") {
          setTotalDiaryCount(diary.value.data.totalCount ?? 0);
        } else {
          console.error("누적 일기 통계 로딩 실패:", diary.reason);
        }

        if (analysis.status === "fulfilled") {
          setTotalEmotionDistribution(analysis.value.data.emotionDistribution ?? {});
        } else {
          console.error("누적 감정 분포 로딩 실패:", analysis.reason);
        }

        if (badges.status === "fulfilled") {
          setTotalBadgeCount(badges.value.data.badgeCount ?? 0);
        } else {
          console.error("누적 뱃지 통계 로딩 실패:", badges.reason);
        }

        if (mood.status === "fulfilled") {
          setMoodRanking(mood.value.data);
        } else {
          console.error("누적 기분 랭킹 로딩 실패:", mood.reason);
        }
        
        if (keywordExplore.status === "fulfilled") {
          const exploreRaw = keywordExplore.value.data.keywordToEmotions ?? {};
          const mappedList = Object.entries(exploreRaw).map(([keyword, emotions]) => ({
            keyword,
            emotions
          }));
          setTotalKeywordMapping(mappedList);
        } else {
          console.error("누적 키워드 감정 탐구 로딩 실패:", keywordExplore.reason);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingTotal(false);
      }
    };

    fetchTotalData();
  }, []);

  useEffect(() => {
  console.log("🔥 [totalKeywordMapping data] =", totalKeywordMapping);
}, [totalKeywordMapping]);

  // 악기 음 샘플 가져오기
  useEffect(() => {
    const loadSampler = async () => {
      await Tone.start();

      const inst = characterToInstrument[userCharacter] || "piano";
      const instPath = INSTRUMENT_MAP[inst];

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
          console.log("🎵 샘플러 로드 완료");
          samplerRef.current = sampler;
          setSamplerLoaded(true);
        }
      }).toDestination();
    };

    loadSampler();
  }, [userCharacter]);

  // 음 재생
  const playMelody = async () => {
    console.group("🎧 PLAY MELODY DEBUG START");

    await Tone.start();
    console.log("🔊 Tone.start() 완료");

    // 샘플러 상태
    console.log("🎹 samplerLoaded =", samplerLoaded);
    console.log("🎹 samplerRef =", samplerRef.current);

    if (!samplerLoaded || !samplerRef.current) {
      console.warn("⚠️ 샘플러가 아직 준비되지 않았습니다!");
      console.groupEnd();
      return;
    }

    const sampler = samplerRef.current;
    const weekDays = getWeekDateList(currentWeek.baseDate);
    const now = Tone.now();

    // 디버깅 스택
    const debugList: any[] = [];

    weekDays.forEach((dateStr, i) => {
      const noteObj = weeklyNotes.find(n => n.date === dateStr || normalize(n.date) === dateStr);

      debugList.push({
        index: i,
        dateStr,
        noteObj,
        noteValue: noteObj?.note,
        mapped: noteObj ? NOTE_MAP[noteObj.note] : null,
        delay: now + i * 0.6
      });

      if (!noteObj) {
        console.warn(`⚠️ ${dateStr}: 해당 날짜에 noteObj 없음`);
        return;
      }

      const midiNote = NOTE_MAP[noteObj.note];

      if (!midiNote) {
        console.error(`❌ NOTE_MAP에서 매핑 실패: note="${noteObj.note}"`);
        return;
      }

      console.log(`🎵 재생 예약 → ${midiNote} @ time = ${now + i * 0.6}`);
      sampler.triggerAttackRelease(midiNote, 0.5, now + i * 0.6);
    });

    console.table(debugList);

    console.groupEnd();

    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), weekDays.length * 600);
  };

  if (showMonthlyAnswers) {
    return <MonthlyAnswers onBack={() => setShowMonthlyAnswers(false)} />;
  }

  return (
    <div className="p-4 space-y-4">
      {showPairing ? (
        <WatchPairingView onBack={() => setShowPairing(false)} />
      ) : (
        <>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-medium">통계</h1>
          {/* 감정 탭일 때만 주간/월간/누적 표시 */}
          {selectedTab === 'emotion' && (
            <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as 'week' | 'month' | 'total')}>
              <TabsList className="grid w-[280px] grid-cols-3">
                <TabsTrigger value="week">주간</TabsTrigger>
                <TabsTrigger value="month">월간</TabsTrigger>
                <TabsTrigger value="total">누적</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        {/* 감정 / 건강 탭 세그먼트 */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => setSelectedTab('emotion')}
            className="px-6 py-2 rounded-full transition-all"
            style={{
              backgroundColor: selectedTab === 'emotion' ? '#7B8B4F' : 'transparent',
              color: selectedTab === 'emotion' ? 'white' : '#4A3228',
              opacity: selectedTab === 'emotion' ? 1 : 0.4,
              border: selectedTab === 'emotion' ? 'none' : '1px solid #E5E5E5'
            }}
          >
            감정
          </button>
          <button
            onClick={() => setSelectedTab('health')}
            className="px-6 py-2 rounded-full transition-all"
            style={{
              backgroundColor: selectedTab === 'health' ? '#7B8B4F' : 'transparent',
              color: selectedTab === 'health' ? 'white' : '#4A3228',
              opacity: selectedTab === 'health' ? 1 : 0.4,
              border: selectedTab === 'health' ? 'none' : '1px solid #E5E5E5'
            }}
          >
            건강
          </button>
        </div>

        {selectedTab === 'health' && (
          <HealthStatsTab
            isConnected={isHealthConnected === 'true'}
            onNavigateToPairing={() => {
              console.log("📲 health: setShowPairing(true)");
              setShowPairing(true);
            }}
          />
        )}

        {selectedTab === 'emotion' && (
          <>
            {/* 날짜 네비게이션 */}
            {selectedPeriod === 'week' ? (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleWeekChange('prev')}
                  className="text-[#4A3228]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-[#4A3228]">
                      {year}년 {month}월 {week}주차
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <div className="p-2 space-y-2">
                      <div>
                        <p className="text-xs mb-1 px-2" style={{ color: '#4A3228', opacity: 0.6 }}>
                          년도
                        </p>
                        <div className="grid grid-cols-3 gap-1">
                          {[2020, 2021, 2022, 2023, 2024, 2025].map((year) => (
                            <Button
                              key={year}
                              variant={year === selectedWeek.year ? 'default' : 'ghost'}
                              size="sm"
                              className="h-8"
                              onClick={() => handleWeekDateSelect(year, selectedWeek.month, selectedWeek.week)}
                            >
                              {year}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs mb-1 px-2" style={{ color: '#4A3228', opacity: 0.6 }}>
                          월
                        </p>
                        <div className="grid grid-cols-6 gap-1">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <Button
                              key={month}
                              variant={month === selectedWeek.month ? 'default' : 'ghost'}
                              size="sm"
                              className="h-8"
                              onClick={() => handleWeekDateSelect(selectedWeek.year, month, selectedWeek.week)}
                            >
                              {month}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs mb-1 px-2" style={{ color: '#4A3228', opacity: 0.6 }}>
                          주차
                        </p>
                        <div className="grid grid-cols-5 gap-1">
                          {[1, 2, 3, 4, 5, 6].map((week) => (
                            <Button
                              key={week}
                              variant={week === selectedWeek.week ? 'default' : 'ghost'}
                              size="sm"
                              className="h-8"
                              onClick={() => handleWeekDateSelect(selectedWeek.year, selectedWeek.month, week)}
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
                  onClick={() => handleWeekChange('next')}
                  className="text-[#4A3228]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            ) : selectedPeriod === 'month' ? (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMonthChange('prev')}
                  className="text-[#4A3228]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-[#4A3228]">
                      {currentMonth.year}년 {currentMonth.month}월
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <div className="p-2 space-y-2">
                      <div>
                        <p className="text-xs mb-1 px-2" style={{ color: '#4A3228', opacity: 0.6 }}>
                          년도
                        </p>
                        <div className="grid grid-cols-3 gap-1">
                          {[2020, 2021, 2022, 2023, 2024, 2025].map((year) => (
                            <Button
                              key={year}
                              variant={year === currentMonth.year ? 'default' : 'ghost'}
                              size="sm"
                              className="h-8"
                              onClick={() => handleMonthDateSelect(year, currentMonth.month)}
                            >
                              {year}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs mb-1 px-2" style={{ color: '#4A3228', opacity: 0.6 }}>
                          월
                        </p>
                        <div className="grid grid-cols-6 gap-1">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <Button
                              key={month}
                              variant={month === currentMonth.month ? 'default' : 'ghost'}
                              size="sm"
                              className="h-8"
                              onClick={() => handleMonthDateSelect(currentMonth.year, month)}
                            >
                              {month}
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
                  onClick={() => handleMonthChange('next')}
                  className="text-[#4A3228]"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            ) : null}

            {/* ========== 주간 탭 ========== */}
            {selectedPeriod === 'week' && (
              <>
                {/* 1️⃣ 이번 주 감정 악보 */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Music className="w-5 h-5 mr-2" style={{ color: '#7B8B4F' }} />
                        이번 주 감정 악보
                      </CardTitle>
                      <Button
                        size="sm"
                        onClick={playMelody}
                        disabled={isPlaying || weeklyNotes.length === 0}
                        style={{ backgroundColor: isPlaying ? '#5D3F35' : '#7B8B4F', color: 'white' }}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            정지
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            재생
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingWeekly ? (
                      <Skeleton className="h-48 w-full" />
                    ) : weeklyNotes.length === 0 ? (
                      <div className="text-center py-8 text-sm text-gray-500">데이터가 없어요.</div>
                    ) : (
                      <div className="relative rounded-lg p-2">
                        {/* =====  오선  ===== */}
                        <div className="relative" style={{ height: '140px' }}>
                          {[44, 58, 72, 86, 100].map((yPos, index) => (
                            <div
                              key={index}
                              className="absolute"
                              style={{
                                top: `${yPos}px`,
                                left: 0,
                                width: '100%',
                                height: '1.5px',
                                backgroundColor: 'var(--staff-line-color, #4A3228)',
                                opacity: 'var(--staff-line-opacity, 0.4)'
                              }}
                            />
                          ))}

                          {/* =====  주간 음표 그리기  ===== */}
                          {(() => {
                            const dateList = getWeekDateList(currentWeek.baseDate);

                            const sortedNotes = dateList.map((d) =>
                              weeklyNotes.find((n) => normalize(n.date) === d) || null
                            );

                            return sortedNotes.map((noteData, dayIndex) => {
                              if (!noteData) return null;

                              const dateStr = normalize(noteData.date);

                              // 🔥 map 안에서는 hook 금지 → 미리 계산한 weeklyContentLengths 사용
                              const realContentLength =
                                weeklyContentLengths[dateStr] ?? 0;

                              const xPercent = (dayIndex + 0.5) * (100 / 7);

                              return (
                                <div
                                  key={noteData.date}
                                  className="absolute"
                                  style={{
                                    left: `${xPercent}%`,
                                    top: "0px",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 10,
                                  }}
                                >
                                  <NoteHead
                                    note={noteData.note}
                                    emotion={noteData.emotion}
                                    score={noteData.score}
                                    contentLength={realContentLength}
                                    size={35}
                                  />
                                </div>
                              );
                            });
                          })()}
                        </div>

                        {/* ===== 요일 + 감정 텍스트 ===== */}
                        <div className="grid grid-cols-7 gap-0 mt-6">
                          {(() => {
                            const dateList = getWeekDateList(currentWeek.baseDate);

                            return dateList.map((dateStr, i) => {
                              const noteData = weeklyNotes.find(n => normalize(n.date) === dateStr);
                              const dayName = dayOfWeekNames[i];

                              return (
                                <div key={i} className="flex-1 text-center">
                                  <span className={`text-xs block ${noteData ? 'font-medium' : 'text-gray-400'}`}>
                                    {dayName}
                                  </span>
                                  {noteData && (
                                    <div className="text-[10px] mt-0.5" style={{ color: '#7B8B4F' }}>
                                      {emotionNames[noteData.emotion]}
                                    </div>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 2️⃣ 챌린지 완료율 (주간) */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" style={{ color: '#7B8B4F' }} />
                      이번 주 챌린지 완료율
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingWeekly ? (
                      <Skeleton className="h-20 w-full" />
                    ) : !weeklyChallengeStats ? (
                      <div className="text-center py-4 text-sm text-gray-500">
                        데이터가 없어요.
                      </div>
                    ) : (
                      (() => {
                        const total = weeklyChallengeStats?.totalChallenges ?? 0;
                        const completed = weeklyChallengeStats?.completedChallenges ?? 0;
                        const rate = weeklyChallengeStats?.completionRate ?? 0;

                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-3xl font-semibold" style={{ color: '#7B8B4F' }}>
                                {Math.round(rate * 100)}%
                              </span>
                            </div>
                            <Progress value={rate * 100} className="h-3" />
                            <p className="text-sm text-center" style={{ color: '#4A3228', opacity: 0.7 }}>
                              총 {total}개 중 {completed}개 완료
                            </p>
                          </div>
                        );
                      })()
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* ========== 월간 탭 ========== */}
            {selectedPeriod === 'month' && (
              <>
                {/* 1️⃣ 일기 기록 현황 (월간) */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" style={{ color: '#7B8B4F' }} />
                      일기 기록 현황
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMonthly ? (
                      <Skeleton className="h-16 w-full" />
                    ) : (
                      <div className="flex items-center gap-4 py-2">
                        <p className="text-5xl font-bold" style={{ color: '#7B8B4F' }}>
                          {monthlyDiaryStats?.monthlyCount || 0}
                        </p>
                        <p className="text-sm" style={{ color: '#4A3228', opacity: 0.7 }}>
                          개의 일기를 작성했어요
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 2️⃣ 감정별 챌린지 수행 현황 (월간) */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2" style={{ color: '#7B8B4F' }} />
                      감정별 챌린지 수행 현황
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMonthly ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {monthlyChallengePerformance && Object.entries(monthlyChallengePerformance).length > 0 ? (
                          Object.entries(monthlyChallengePerformance).map(([emotion, stats]) => {
                            const percentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                            const EmotionIcon = emotionIcons[emotion as keyof typeof emotionIcons];
                            const colorClass = emotionColorClasses[emotion as keyof typeof emotionColorClasses];

                            return (
                              <div key={emotion} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {EmotionIcon && (
                                      <EmotionIcon className={`w-4 h-4 ${colorClass.text}`} />
                                    )}
                                    <span className="text-sm">
                                      {emotionNames[emotion as keyof typeof emotionNames]}
                                    </span>
                                  </div>
                                  <span className="text-sm font-medium">
                                    {stats.completed}/{stats.total}개
                                  </span>
                                </div>

                                <div
                                  className="h-1.5 rounded-full overflow-hidden"
                                  style={{
                                    backgroundColor: isDarkMode ? "#36392D" : "#E3E5D6",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${percentage}%`,
                                      height: "100%",
                                      backgroundColor: "#7B8B4F",
                                      transition: "width 0.3s ease",
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 text-sm text-gray-500">
                            데이터가 없어요.
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 3️⃣ 음악 추천 통계 (월간) */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Headphones className="w-5 h-5 mr-2" style={{ color: '#7B8B4F' }} />
                      음악 추천 통계
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMonthly ? (
                      <Skeleton className="h-32 w-full" />
                    ) : !monthlyMusicStats ? (
                      <div className="text-center py-4 text-sm text-gray-500">데이터가 없어요.</div>
                    ) : (
                      <div className="space-y-4">

                        {/* ===============================
                            1) topGenre 계산
                        =============================== */}
                        {(() => {
                          const mappings = monthlyMusicStats.emotionGenreMapping ?? {};
                          const topGenre = getTopGenre(mappings);

                          return (
                            <div className="bg-gradient-to-r from-[#7B8B4F]/10 to-[#7B8B4F]/5 rounded-lg p-4 text-center">
                              <p className="text-sm mb-1" style={{ color: '#4A3228', opacity: 0.7 }}>
                                가장 많이 추천된 장르
                              </p>
                              <p className="text-xl font-semibold" style={{ color: '#7B8B4F' }}>
                                {topGenre ? `${topGenre} 🎷` : '이번 달 음악 추천 기록이 없어요'}
                              </p>
                            </div>
                          );
                        })()}

                        {/* ===============================
                            2) 감정별 상세 breakdown
                        =============================== */}
                        <div className="space-y-4">
                          <p className="text-sm" style={{ color: '#4A3228', opacity: 0.7 }}>
                            감정별 추천 상세 내역
                          </p>

                          {monthlyMusicStats.emotionGenreMapping &&
                            Object.entries(monthlyMusicStats.emotionGenreMapping).length > 0 ? (
                            Object.entries(monthlyMusicStats.emotionGenreMapping).map(([emotionKey, genres]) => {
                              const visibleGenres = Object.entries(genres ?? {})
                                .map(([genre, count]) => [genre, Number(count)] as const)
                                .filter(([, count]) => count > 0);

                              if (visibleGenres.length === 0) return null;

                              const emotion = emotionMap[emotionKey] ?? 'APATHY';
                              const emotionLabel = getEmotionDisplayLabel(emotionKey);
                              const totalCount = visibleGenres.reduce((sum, [, count]) => sum + count, 0);
                              const EmotionIcon = emotionIcons[emotion];
                              const colorClass = emotionColorClasses[emotion];

                              return (
                                <div key={emotionKey} className="p-3 border rounded-lg bg-white/60">
                                  <div className="flex items-center gap-2 mb-2">
                                    {EmotionIcon && (
                                      <EmotionIcon className={`w-4 h-4 ${colorClass.text}`} />
                                    )}
                                    <span className="text-sm font-medium">
                                      {emotionLabel} ({totalCount}곡)
                                    </span>
                                  </div>

                                  <div className="pl-2 space-y-1">
                                    {visibleGenres.map(([genre, count]) => (
                                      <div key={genre} className="flex items-center justify-between text-sm">
                                        <span>{genre}</span>
                                        <span style={{ color: '#7B8B4F' }}>{count}곡</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-4 text-sm text-gray-500">데이터가 없어요.</div>
                          )}
                        </div>

                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 4️⃣ 키워드 랭킹 (월간) */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Hash className="w-5 h-5 mr-2" style={{ color: '#7B8B4F' }} />
                      키워드 랭킹
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMonthly ? (
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <Skeleton key={i} className="h-8 w-full" />)}
                      </div>
                    ) : monthlyKeywords.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500">
                        데이터가 없어요.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {monthlyKeywords.map((keyword, index) => {
                          const maxCount = monthlyKeywords[0]?.count || 1;
                          const percentage = (keyword.count / maxCount) * 70;

                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span
                                    className="text-xs font-medium"
                                    style={{
                                      color: 'var(--primary)',
                                      minWidth: '20px',
                                    }}
                                  >
                                    {index + 1}
                                  </span>

                                  <span className="text-sm">{keyword.keyword}</span>
                                </div>

                                <span
                                  className="text-sm font-medium"
                                  style={{ color: 'var(--primary)' }}
                                >
                                  {keyword.count}회
                                </span>
                              </div>

                              <div
                                className="h-2 rounded-full overflow-hidden"
                                style={{
                                  backgroundColor: "#E8EAD9",  
                                }}
                              >
                                <div
                                  style={{
                                    width: `${percentage}%`,
                                    height: "100%",
                                    backgroundColor: "#7B8B4F",
                                    transition: "width 0.3s ease",
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* ========== 누적 탭 ========== */}
            {selectedPeriod === 'total' && (
              <>
                {/* 1️⃣ 일기 총 작성 수 (누적) */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" style={{ color: '#7B8B4F' }} />
                      일기 총 작성 수
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTotal ? (
                      <Skeleton className="h-16 w-full" />
                    ) : (
                      <div className="flex items-center gap-4 py-2">
                        <p className="text-5xl font-bold" style={{ color: '#7B8B4F' }}>
                          {totalDiaryCount}
                        </p>
                        <p className="text-sm" style={{ color: '#4A3228', opacity: 0.7 }}>
                          개의 이야기가 쌓였어요
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 2️⃣ 감정 분포 비율 (누적) */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="w-5 h-5 mr-2" style={{ color: '#7B8B4F' }} />
                      감정 분포 비율
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTotal ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : !totalEmotionDistribution || Object.keys(totalEmotionDistribution ?? {}).length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500">
                        데이터가 없어요.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(totalEmotionDistribution ?? {}).map(([emoKo, count]) => {
                          const emotion =
                            emoKo === '기쁨' ? 'JOY' :
                            emoKo === '슬픔' ? 'SADNESS' :
                            emoKo === '분노' ? 'ANGER' :
                            emoKo === '화남' ? 'ANGER' :
                            emoKo === '무기력' ? 'APATHY' :
                            emoKo === '예민' ? 'SENSITIVE' :
                            'APATHY';

                          const total = Object.values(totalEmotionDistribution ?? {}).reduce((a, b) => a + b, 0);
                          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                          const EmotionIcon = emotionIcons[emotion];
                          const colorClass = emotionColorClasses[emotion];

                          return (
                            <div key={emotion} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {EmotionIcon && <EmotionIcon className={`w-4 h-4 ${colorClass.text}`} />}
                                  <span className="text-sm">
                                    {emotionNames[emotion]}
                                  </span>
                                </div>
                                <span className="text-sm font-medium">{percentage}%</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 3️⃣ 획득한 뱃지 (누적) */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2" style={{ color: '#7B8B4F' }} />
                      획득한 뱃지
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTotal ? (
                      <Skeleton className="h-16 w-full" />
                    ) : (
                      <div className="flex items-center gap-4 py-2">
                        <p className="text-5xl font-bold" style={{ color: '#7B8B4F' }}>
                          {totalBadgeCount}
                        </p>
                        <p className="text-sm" style={{ color: '#4A3228', opacity: 0.7 }}>
                          개의 뱃지를 획득했어요
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 4️⃣ 기분 랭킹 (누적) */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="w-5 h-5 mr-2" style={{ color: '#7B8B4F' }} />
                      기분 랭킹
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTotal ? (
                      <Skeleton className="h-48 w-full" />
                    ) : !moodRanking || !moodRanking.emotionToKeywords ? (
                      <div className="text-center py-4 text-sm text-gray-500">데이터가 없어요.</div>
                    ) : (
                      <div className="space-y-6">

                        {Object.entries(moodRanking.emotionToKeywords).map(([emotion, keywords]) => {
                          const EmotionIcon = emotionIcons[emotion as keyof typeof emotionIcons];
                          const emotionName = emotionNames[emotion as keyof typeof emotionNames];
                          const colorClass = emotionColorClasses[emotion as keyof typeof emotionColorClasses];

                          return (
                            <div key={emotion}>
                              <div className="flex items-center gap-2 mb-3">
                                {EmotionIcon && (
                                  <EmotionIcon className="w-4 h-4" style={{ color: colorClass.bar }} />
                                )}
                                <p className="text-sm" style={{ color: '#7B8B4F' }}>
                                  {emotionName}를 느낄 때 자주 등장한 키워드
                                </p>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                {keywords.length > 0 ? (
                                  keywords.map((keyword, index) => (
                                    <div
                                      key={index}
                                      className="bg-gradient-to-br from-[#7B8B4F]/5 to-[#7B8B4F]/10 rounded-lg p-3 text-center border"
                                      style={{ borderColor: '#E5E5E5' }}
                                    >
                                      <div className="text-xs mb-1" style={{ color: '#7B8B4F' }}>
                                        {index + 1}위
                                      </div>
                                      <div className="text-sm mb-1" style={{ color: '#4A3228' }}>
                                        {keyword}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-4 text-sm text-gray-500 col-span-3">
                                    데이터가 없어요.
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 5️⃣ 키워드 감정 탐구 (누적) */}
                <Card className="bg-card/90 backdrop-blur-sm border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground">
                      <BarChart3 className="w-5 h-5 mr-2" style={{ color: '#7B8B4F' }} />
                      키워드 감정 탐구
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTotal ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                      </div>
                    ) : !totalKeywordMapping || totalKeywordMapping.length === 0 ? (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        데이터가 없어요.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm mb-3 text-muted-foreground">
                          키워드별 감정 기록 통계
                        </p>
                        {totalKeywordMapping.map((item, index) => {
                          const totalCount = Object.values(item.emotions ?? {}).reduce((a, b) => a + b, 0);

                          return (
                            <div key={index} className="bg-card rounded-lg p-3 border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-foreground">{item.keyword}</span>
                                <span className="text-sm text-muted-foreground">총 {totalCount}회</span>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {Object.entries(item.emotions ?? {}).map(([emoKo, count]) => {
                                  const emotion = emotionMap[emoKo]; 
                                  if (!emotion) return null; // 잘못된 감정값이면 건너뛰기

                                  const EmotionIcon = emotionIcons[emotion];
                                  const colorClass = emotionColorClasses[emotion];

                                  return (
                                    <div
                                      key={`${item.keyword}-${emotion}`}   // ← 키 중복 완전 방지
                                      className={`flex items-center gap-1 px-2 py-1 rounded ${colorClass.bg}`}
                                    >
                                      {EmotionIcon && <EmotionIcon className={`w-3 h-3 ${colorClass.text}`} />}
                                      <span className={`text-xs ${colorClass.text}`}>{count}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 6️⃣ 월간 질문 */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircleQuestion className="w-5 h-5 mr-2" style={{ color: '#7B8B4F' }} />
                      월간 질문
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4" style={{ color: '#4A3228', opacity: 0.7 }}>
                      매일의 질문에 답하고 월간 패턴을 확인해보세요.
                    </p>
                    <Button 
                      className="w-full"
                      style={{ backgroundColor: '#7B8B4F', color: 'white' }}
                      onClick={() => setShowMonthlyAnswers(true)}
                    >
                      월간 답변 보기
                    </Button>
                  </CardContent>
                </Card>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
