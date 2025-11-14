import React, { useState, useEffect } from 'react';
import * as Tone from "tone";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { MonthlyAnswers } from './questions/MonthlyAnswers';
import { MusicalNote } from './calendar/MusicalNote';
import { notePositions, emotionColors, getStemDirection } from './calendar/noteMapping';
import { HealthStatsTab } from './statistics/HealthStatsTab';
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

interface KeywordRankingResponse {
  rankings: Array<{ keyword: string; count: number }>;
}

interface ChallengeCompletionResponse {
  total: number;
  completed: number;
  rate: number;
}

interface AnalysisStatsResponse {
  distribution: { [emotionLabel: string]: number };
}

interface ChallengeEmotionPerformanceResponse {
  stats: { [emotionType: string]: number };
}

interface MusicStatsResponse {
  monthlyCount: number;
  topGenre: string;
  mapping: { [emotionLabel: string]: { [genre: string]: number } };
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

interface KeywordEmotionMappingResponse {
  mappings: Array<{ keyword: string; emotions: Record<string, number> }>;
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

const emotionColorMap = {
  JOY: '#FFE080',
  SADNESS: '#90C8FF',
  ANGER: '#FFA0A0',
  SENSITIVE: '#C4B0FF',
  APATHY: '#C8C8C8'
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
  const [showMonthlyAnswers, setShowMonthlyAnswers] = useState(false);
  const isDarkMode =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");
  
  const today = new Date();
  const [currentWeek, setCurrentWeek] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    week: Math.ceil(today.getDate() / 7)
  });
  const [currentMonth, setCurrentMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1
  });
  
  // 건강 데이터 연동 여부 확인
  const isHealthConnected = localStorage.getItem('healthDataConnected') === 'true';

  const characterToInstrument: Record<string, string> = {
    "PIANO": "piano",
    "VIOLIN": "violin",
    "GUITAR": "guitar",
    "FLUTE": "flute",
    "MARIMBA": "marimba",
  };
  const getUserInstrument = (): string => {
    const savedProfile = localStorage.getItem("profileData");
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      const character = profile.character || "PIANO";
      return characterToInstrument[character] || "piano";
    }
    return "piano";
  };

  // ========== Data States ==========
  // 주간
  const [weeklyNotes, setWeeklyNotes] = useState<CalendarNoteDto[]>([]);
  const [weeklyChallengeStats, setWeeklyChallengeStats] = useState<ChallengeCompletionResponse | null>(null);
  
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

  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);
  const [isLoadingTotal, setIsLoadingTotal] = useState(false);

  // ========== Handlers ==========
  const handleWeekChange = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      let newYear = prev.year;
      let newMonth = prev.month;
      let newWeek = direction === 'next' ? prev.week + 1 : prev.week - 1;

      if (newWeek > 5) {
        newWeek = 1;
        newMonth++;
        if (newMonth > 12) {
          newMonth = 1;
          newYear++;
        }
      } else if (newWeek < 1) {
        newWeek = 5;
        newMonth--;
        if (newMonth < 1) {
          newMonth = 12;
          newYear--;
        }
      }

      return { year: newYear, month: newMonth, week: newWeek };
    });
  };

  const handleWeekDateSelect = (year: number, month: number, week: number) => {
    setCurrentWeek({ year, month, week });
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
    const fetchWeeklyData = async () => {
      setIsLoadingWeekly(true);
      try {
        const { year, month, week } = currentWeek;
        
        // 주차별 다른 데이터
        const mockDataByWeek: Record<number, CalendarNoteDto[]> = {
          1: [
            { date: `${year}-${String(month).padStart(2, '0')}-03`, note: 'SOL', emotionLabel: 'JOY', score: 85 },
            { date: `${year}-${String(month).padStart(2, '0')}-04`, note: 'MI', emotionLabel: 'SADNESS', score: 65 },
            { date: `${year}-${String(month).padStart(2, '0')}-06`, note: 'DO', emotionLabel: 'ANGER', score: 55 },
          ],
          2: [
            { date: `${year}-${String(month).padStart(2, '0')}-09`, note: 'LA', emotionLabel: 'JOY', score: 90 },
            { date: `${year}-${String(month).padStart(2, '0')}-11`, note: 'FA', emotionLabel: 'APATHY', score: 70 },
            { date: `${year}-${String(month).padStart(2, '0')}-12`, note: 'RE', emotionLabel: 'SENSITIVE', score: 60 },
            { date: `${year}-${String(month).padStart(2, '0')}-14`, note: 'SOL', emotionLabel: 'JOY', score: 88 },
          ],
          3: [
            { date: `${year}-${String(month).padStart(2, '0')}-17`, note: 'SOL', emotionLabel: 'JOY', score: 88 },
            { date: `${year}-${String(month).padStart(2, '0')}-18`, note: 'MI', emotionLabel: 'SADNESS', score: 62 },
            { date: `${year}-${String(month).padStart(2, '0')}-20`, note: 'LA', emotionLabel: 'JOY', score: 92 },
            { date: `${year}-${String(month).padStart(2, '0')}-21`, note: 'FA', emotionLabel: 'APATHY', score: 72 },
            { date: `${year}-${String(month).padStart(2, '0')}-22`, note: 'RE', emotionLabel: 'SENSITIVE', score: 66 },
          ],
          4: [
            { date: `${year}-${String(month).padStart(2, '0')}-24`, note: 'DO', emotionLabel: 'ANGER', score: 58 },
            { date: `${year}-${String(month).padStart(2, '0')}-26`, note: 'FA', emotionLabel: 'APATHY', score: 68 },
            { date: `${year}-${String(month).padStart(2, '0')}-27`, note: 'SOL', emotionLabel: 'JOY', score: 85 },
          ],
          5: [
            { date: `${year}-${String(month).padStart(2, '0')}-29`, note: 'LA', emotionLabel: 'JOY', score: 91 },
            { date: `${year}-${String(month).padStart(2, '0')}-30`, note: 'MI', emotionLabel: 'SADNESS', score: 64 },
          ],
        };
        
        const notes = mockDataByWeek[week] || [];
        setWeeklyNotes(notes);

        // 주간 챌린지 완료율 (주차별 다름)
        const challengeByWeek: Record<number, ChallengeCompletionResponse> = {
          1: { total: 7, completed: 3, rate: 3 / 7 },
          2: { total: 7, completed: 5, rate: 5 / 7 },
          3: { total: 7, completed: 6, rate: 6 / 7 },
          4: { total: 7, completed: 4, rate: 4 / 7 },
          5: { total: 7, completed: 2, rate: 2 / 7 },
        };
        setWeeklyChallengeStats(challengeByWeek[week] || { total: 7, completed: 0, rate: 0 });

      } catch (error) {
        console.error('주간 데이터 로딩 실패:', error);
      } finally {
        setIsLoadingWeekly(false);
      }
    };

    fetchWeeklyData();
  }, [currentWeek]);

  // ========== Fetch Monthly Data ==========
  useEffect(() => {
    const fetchMonthlyData = async () => {
      setIsLoadingMonthly(true);
      try {
        const { year, month } = currentMonth;
        
        // 월별 다른 데이터
        const diaryByMonth: Record<number, DiaryStatsResponse> = {
          10: { totalCount: 84, monthlyCount: 28 },
          11: { totalCount: 84, monthlyCount: 30 },
          12: { totalCount: 84, monthlyCount: 25 },
        };
        setMonthlyDiaryStats(diaryByMonth[month] || { totalCount: 84, monthlyCount: 20 });

        // 월별 챌린지 수행 현황 (완료 수 / 전체 수)
        const challengeByMonth: Record<number, Record<string, { completed: number; total: number }>> = {
          10: { 
            'JOY': { completed: 12, total: 18 }, 
            'SADNESS': { completed: 8, total: 14 }, 
            'ANGER': { completed: 5, total: 8 }, 
            'SENSITIVE': { completed: 3, total: 6 }, 
            'APATHY': { completed: 2, total: 4 } 
          },
          11: { 
            'JOY': { completed: 15, total: 20 }, 
            'SADNESS': { completed: 8, total: 12 }, 
            'ANGER': { completed: 4, total: 7 }, 
            'SENSITIVE': { completed: 2, total: 5 }, 
            'APATHY': { completed: 1, total: 3 } 
          },
          12: { 
            'JOY': { completed: 10, total: 16 }, 
            'SADNESS': { completed: 6, total: 10 }, 
            'ANGER': { completed: 6, total: 9 }, 
            'SENSITIVE': { completed: 2, total: 4 }, 
            'APATHY': { completed: 1, total: 2 } 
          },
        };
        setMonthlyChallengePerformance(challengeByMonth[month] || { 
          'JOY': { completed: 10, total: 15 }, 
          'SADNESS': { completed: 5, total: 10 }, 
          'ANGER': { completed: 3, total: 6 }, 
          'SENSITIVE': { completed: 2, total: 4 }, 
          'APATHY': { completed: 1, total: 2 } 
        });

        // 월별 음악 통계
        const musicByMonth: Record<number, MusicStatsResponse> = {
          10: {
            monthlyCount: 25,
            topGenre: '팝',
            mapping: {
              'JOY': { 'Pop': 10, 'Jazz': 3, 'Classical': 2 },
              'SADNESS': { 'Ballad': 6, 'Classical': 2 },
              'ANGER': { 'Rock': 4, 'Electronic': 1 },
              'SENSITIVE': { 'Indie': 3, 'Ballad': 2 },
              'APATHY': { 'Ambient': 2, 'Lo-fi': 1 }
            }
          },
          11: {
            monthlyCount: 28,
            topGenre: '재즈',
            mapping: {
              'JOY': { 'Pop': 12, 'Jazz': 5, 'Classical': 3 },
              'SADNESS': { 'Ballad': 8, 'Classical': 4 },
              'ANGER': { 'Rock': 6, 'Electronic': 2 },
              'SENSITIVE': { 'Indie': 5, 'Ballad': 3 },
              'APATHY': { 'Ambient': 4, 'Lo-fi': 2 }
            }
          },
          12: {
            monthlyCount: 22,
            topGenre: '클래식',
            mapping: {
              'JOY': { 'Pop': 8, 'Jazz': 4, 'Classical': 5 },
              'SADNESS': { 'Ballad': 5, 'Classical': 6 },
              'ANGER': { 'Rock': 5, 'Electronic': 3 },
              'SENSITIVE': { 'Indie': 3, 'Ballad': 2 },
              'APATHY': { 'Ambient': 3, 'Lo-fi': 1 }
            }
          },
        };
        setMonthlyMusicStats(musicByMonth[month] || musicByMonth[11]);

        // 월별 키워드 (최대 31개)
        const keywordsByMonth: Record<number, Array<{ keyword: string; count: number }>> = {
          10: [
            { keyword: '운동', count: 15 },
            { keyword: '친구', count: 12 },
            { keyword: '커피', count: 10 },
            { keyword: '산책', count: 8 },
            { keyword: '음악', count: 7 },
            { keyword: '영화', count: 6 },
            { keyword: '독서', count: 5 },
            { keyword: '가족', count: 4 },
            { keyword: '여행', count: 3 },
            { keyword: '요리', count: 2 }
          ],
          11: [
            { keyword: '커피', count: 18 },
            { keyword: '친구', count: 15 },
            { keyword: '산책', count: 12 },
            { keyword: '독서', count: 10 },
            { keyword: '음악', count: 9 },
            { keyword: '영화', count: 7 },
            { keyword: '운동', count: 6 },
            { keyword: '가족', count: 5 },
            { keyword: '여행', count: 4 },
            { keyword: '요리', count: 3 }
          ],
          12: [
            { keyword: '가족', count: 20 },
            { keyword: '커피', count: 16 },
            { keyword: '친구', count: 14 },
            { keyword: '독서', count: 11 },
            { keyword: '영화', count: 9 },
            { keyword: '음악', count: 8 },
            { keyword: '산책', count: 7 },
            { keyword: '운동', count: 5 },
            { keyword: '여행', count: 3 },
            { keyword: '요리', count: 2 }
          ],
        };
        setMonthlyKeywords(keywordsByMonth[month] || keywordsByMonth[11]);

      } catch (error) {
        console.error('월간 데이터 로딩 실패:', error);
      } finally {
        setIsLoadingMonthly(false);
      }
    };

    fetchMonthlyData();
  }, [currentMonth]);

  // ========== Fetch Total Data ==========
  useEffect(() => {
    const fetchTotalData = async () => {
      setIsLoadingTotal(true);
      try {
        setTotalDiaryCount(84);
        setTotalBadgeCount(12);
        
        setTotalEmotionDistribution({
          'JOY': 45,
          'SADNESS': 28,
          'ANGER': 15,
          'SENSITIVE': 8,
          'APATHY': 4
        });

        // 기쁨일 때 가장 많이 기록된 키워드, 화남일 때 가장 많이 기록된 키워드
        setMoodRanking({
          joyKeywords: [
            { keyword: '친구', icon: '💕', count: 35 },
            { keyword: '산책', icon: '🚶', count: 28 },
            { keyword: '음악', icon: '🎵', count: 24 }
          ],
          angerKeywords: [
            { keyword: '직장', icon: '💼', count: 18 },
            { keyword: '다툼', icon: '💔', count: 12 },
            { keyword: '스트레스', icon: '😤', count: 10 }
          ]
        });

        setTotalKeywordMapping([
          { keyword: '커피', emotions: { 'JOY': 25, 'APATHY': 12, 'SADNESS': 8 } },
          { keyword: '친구', emotions: { 'JOY': 35, 'SENSITIVE': 5 } },
          { keyword: '산책', emotions: { 'JOY': 20, 'SADNESS': 10 } },
          { keyword: '운동', emotions: { 'JOY': 18, 'ANGER': 5 } },
          { keyword: '음악', emotions: { 'JOY': 15, 'SADNESS': 8, 'APATHY': 3 } }
        ]);

      } catch (error) {
        console.error('누적 데이터 로딩 실패:', error);
      } finally {
        setIsLoadingTotal(false);
      }
    };

    fetchTotalData();
  }, []);

  // 악기 음 샘플 가져오기
  useEffect(() => {
    const loadSampler = async () => {
      await Tone.start();

      const raw = getUserInstrument();
      const inst = raw?.toLowerCase() || "piano";
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
  }, []);

  // 음 재생
  const playMelody = async () => {
    if (!samplerLoaded || !samplerRef.current) {
      console.warn("Sampler not loaded yet.");
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    const sampler = samplerRef.current;
    const noteDuration = 0.5;
    const gap = 0.1;

    // 주간 날짜 계산
    const { year, month, week } = currentWeek;
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const startDay = (week - 1) * 7 + 1 - firstDayOfWeek;
    const sunday = new Date(year, month - 1, startDay);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      return date.toISOString().split("T")[0];
    });

    const now = Tone.now();

    weekDays.forEach((dateStr, i) => {
      const noteObj = weeklyNotes.find(n => n.date === dateStr);
      const midiNote = noteObj ? NOTE_MAP[noteObj.note] : null;

      if (midiNote) {
        sampler.triggerAttackRelease(
          midiNote,
          noteDuration,
          now + i * (noteDuration + gap)
        );
      }
    });

    setTimeout(() => setIsPlaying(false), weekDays.length * (noteDuration + gap) * 1000);
  };


  if (showMonthlyAnswers) {
    return <MonthlyAnswers onBack={() => setShowMonthlyAnswers(false)} />;
  }

  return (
    <div className="p-4 space-y-4">
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

      {/* 건강 탭이 선택되면 건강 통계만 표시 */}
      {selectedTab === 'health' ? (
        <HealthStatsTab isConnected={isHealthConnected} />
      ) : (
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
                {currentWeek.year}년 {currentWeek.month}월 {currentWeek.week}주차
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
                        variant={year === currentWeek.year ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8"
                        onClick={() => handleWeekDateSelect(year, currentWeek.month, currentWeek.week)}
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
                        variant={month === currentWeek.month ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8"
                        onClick={() => handleWeekDateSelect(currentWeek.year, month, currentWeek.week)}
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
                    {[1, 2, 3, 4, 5].map((week) => (
                      <Button
                        key={week}
                        variant={week === currentWeek.week ? 'default' : 'ghost'}
                        size="sm"
                        className="h-8"
                        onClick={() => handleWeekDateSelect(currentWeek.year, currentWeek.month, week)}
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
                <div className="text-center py-8 text-sm text-gray-500">
                  데이터가 없어요.
                </div>
              ) : (
                <div className="relative bg-white rounded-lg p-6">
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
                    
                    {(() => {
                      const { year, month, week } = currentWeek;
                      const firstDayOfMonth = new Date(year, month - 1, 1);
                      const firstDayOfWeek = firstDayOfMonth.getDay();
                      
                      const startDay = (week - 1) * 7 + 1 - firstDayOfWeek;
                      const sunday = new Date(year, month - 1, startDay);
                      
                      const weekDays = Array.from({ length: 7 }, (_, i) => {
                        const date = new Date(sunday);
                        date.setDate(sunday.getDate() + i);
                        return date.toISOString().split('T')[0];
                      });
                      
                      return weekDays.map((dateStr, dayIndex) => {
                        const noteData = weeklyNotes.find(n => n.date === dateStr);
                        if (!noteData) return null;
                        
                        const position = notePositions[noteData.note];
                        const color = emotionColorMap[noteData.emotionLabel];
                        const stemDirection = getStemDirection(noteData.note);
        
                        const xPercent = (dayIndex + 0.5) * (100 / 7);
                        
                        return (
                          <div
                            key={dateStr}
                            className="absolute"
                            style={{
                              left: `${xPercent}%`,
                              top: `${position.yOffset}px`,
                              transform: 'translate(-50%, -50%)',
                              zIndex: 10
                            }}
                          >
                            <MusicalNote
                              color={color}
                              size={35}
                              noteLength="quarter"
                              needsLedgerLine={position.needsLedgerLine}
                              stemDirection={stemDirection}
                            />
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-0 mt-6">
                    {(() => {
                      const { year, month, week } = currentWeek;
                      const firstDayOfMonth = new Date(year, month - 1, 1);
                      const firstDayOfWeek = firstDayOfMonth.getDay();
                      
                      const startDay = (week - 1) * 7 + 1 - firstDayOfWeek;
                      const sunday = new Date(year, month - 1, startDay);
                      
                      return Array.from({ length: 7 }, (_, i) => {
                        const date = new Date(sunday);
                        date.setDate(sunday.getDate() + i);
                        const dateStr = date.toISOString().split('T')[0];
                        const noteData = weeklyNotes.find(n => n.date === dateStr);
                        const dayName = dayOfWeekNames[i];
                        
                        return (
                          <div 
                            key={i} 
                            className="flex-1 text-center"
                          >
                            <span className={`text-xs block ${noteData ? 'font-medium' : 'text-gray-400'}`}>
                              {dayName}
                            </span>
                            {noteData && (
                              <div className="text-[10px] mt-0.5" style={{ color: '#7B8B4F' }}>
                                {emotionNames[noteData.emotionLabel]}
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-semibold" style={{ color: '#7B8B4F' }}>
                      {Math.round(weeklyChallengeStats.rate * 100)}%
                    </span>
                  </div>
                  <Progress value={weeklyChallengeStats.rate * 100} className="h-3" />
                  <p className="text-sm text-center" style={{ color: '#4A3228', opacity: 0.7 }}>
                    총 {weeklyChallengeStats.total}개 중 {weeklyChallengeStats.completed}개 완료
                  </p>
                </div>
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
                  {Object.entries(monthlyChallengePerformance).map(([emotion, stats]) => {
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
                          className="h-1.5 rounded-full overflow-hidden ml-7"
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
                  })}
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
                <div className="text-center py-4 text-sm text-gray-500">
                  데이터가 없어요.
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-2" style={{ color: '#4A3228', opacity: 0.7 }}>
                      이번 달 추천받은 곡
                    </p>
                    <p className="text-2xl font-semibold" style={{ color: '#7B8B4F' }}>
                      {monthlyMusicStats.monthlyCount}곡
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#7B8B4F]/10 to-[#7B8B4F]/5 rounded-lg p-4 text-center">
                    <p className="text-sm mb-1" style={{ color: '#4A3228', opacity: 0.7 }}>
                      가장 많이 추천된 장르
                    </p>
                    <p className="text-xl font-semibold" style={{ color: '#7B8B4F' }}>
                      {monthlyMusicStats.topGenre} 🎷
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm" style={{ color: '#4A3228', opacity: 0.7 }}>감정별 추천 곡 수</p>
                    {Object.entries(monthlyMusicStats.mapping).map(([emotion, genres]) => {
                      const totalCount = Object.values(genres).reduce((a, b) => a + b, 0);
                      const EmotionIcon = emotionIcons[emotion as keyof typeof emotionIcons];
                      const colorClass = emotionColorClasses[emotion as keyof typeof emotionColorClasses];

                      return (
                        <div key={emotion} className="flex items-center justify-between py-1">
                          <div className="flex items-center space-x-2">
                            {EmotionIcon && <EmotionIcon className={`w-4 h-4 ${colorClass.text}`} />}
                            <span className="text-sm">{emotionNames[emotion as keyof typeof emotionNames]}</span>
                          </div>
                          <span className="text-sm font-medium" style={{ color: '#7B8B4F' }}>
                            {totalCount}곡
                          </span>
                        </div>
                      );
                    })}
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
                          className="h-1.5 rounded-full overflow-hidden ml-7"
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
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : Object.keys(totalEmotionDistribution).length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  데이터가 없어요.
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(totalEmotionDistribution).map(([emotion, count]) => {
                    const total = Object.values(totalEmotionDistribution).reduce((a, b) => a + b, 0);
                    const percentage = Math.round((count / total) * 100);
                    const EmotionIcon = emotionIcons[emotion as keyof typeof emotionIcons];
                    const colorClass = emotionColorClasses[emotion as keyof typeof emotionColorClasses];

                    return (
                      <div key={emotion} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {EmotionIcon && <EmotionIcon className={`w-4 h-4 ${colorClass.text}`} />}
                            <span className="text-sm">{emotionNames[emotion as keyof typeof emotionNames]}</span>
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
              ) : !moodRanking ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  데이터가 없어요.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 이럴 때 기분이 가장 좋았어요 */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Smile className="w-4 h-4" style={{ color: '#7B8B4F' }} />
                      <p className="text-sm" style={{ color: '#7B8B4F' }}>
                        이럴 때 기분이 가장 좋았어요
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {moodRanking.joyKeywords.map((item, index) => (
                        <div 
                          key={index}
                          className="bg-gradient-to-br from-[#7B8B4F]/5 to-[#7B8B4F]/10 rounded-lg p-3 text-center border"
                          style={{ borderColor: '#E5E5E5' }}
                        >
                          <div className="text-xs mb-1" style={{ color: '#7B8B4F' }}>
                            {index + 1}위
                          </div>
                          <div className="text-2xl mb-1">{item.icon}</div>
                          <div className="text-sm mb-1" style={{ color: '#4A3228' }}>
                            {item.keyword}
                          </div>
                          <div className="text-xs" style={{ color: '#7B8B4F' }}>
                            {item.count}회
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 이럴 때 기분이 가장 좋지 않았어요 */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Angry className="w-4 h-4" style={{ color: '#FFA0A0' }} />
                      <p className="text-sm" style={{ color: '#4A3228', opacity: 0.6 }}>
                        이럴 때 기분이 가장 좋지 않았어요
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {moodRanking.angerKeywords.map((item, index) => (
                        <div 
                          key={index}
                          className="bg-gray-50 rounded-lg p-3 text-center border"
                          style={{ borderColor: '#E5E5E5' }}
                        >
                          <div className="text-xs mb-1" style={{ color: '#4A3228', opacity: 0.6 }}>
                            {index + 1}위
                          </div>
                          <div className="text-2xl mb-1">{item.icon}</div>
                          <div className="text-sm mb-1" style={{ color: '#4A3228' }}>
                            {item.keyword}
                          </div>
                          <div className="text-xs" style={{ color: '#4A3228', opacity: 0.6 }}>
                            {item.count}회
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
              ) : totalKeywordMapping.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  데이터가 없어요.
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm mb-3 text-muted-foreground">
                    키워드별 감정 기록 통계
                  </p>
                  {totalKeywordMapping.map((item, index) => {
                    const totalCount = Object.values(item.emotions).reduce((a, b) => a + b, 0);

                    return (
                      <div key={index} className="bg-card rounded-lg p-3 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">
                            {item.keyword}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            총 {totalCount}회
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {Object.entries(item.emotions).map(([emotion, count]) => {
                            const EmotionIcon = emotionIcons[emotion as keyof typeof emotionIcons];
                            const colorClass = emotionColorClasses[emotion as keyof typeof emotionColorClasses];

                            return (
                              <div 
                                key={emotion}
                                className={`flex items-center gap-1 px-2 py-1 rounded ${colorClass.bg}`}
                              >
                                {EmotionIcon && <EmotionIcon className={`w-3 h-3 ${colorClass.text}`} />}
                                <span className={`text-xs ${colorClass.text}`}>
                                  {count}
                                </span>
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
    </div>
  );
}