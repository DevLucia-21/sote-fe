import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { TextDiaryWrite } from './diary/TextDiaryWrite';
import { OCRPreview } from './diary/OCRPreview';
import { STTTranscribe } from './diary/STTTranscribe';
import { AnswerSheet } from './questions/AnswerSheet';
import { KeywordChip } from './diary/KeywordChip';
import { isDailyQuestionEnabled } from "../utils/settings";
import { AnalysisLoading } from './analysis/AnalysisLoading';
import { AnalysisResult } from './analysis/AnalysisResult';
import { AnalysisResult as AnalysisResultType, EmotionType } from './analysis/types';
import {
  Type,
  Mic,
  PenTool,
  X,
  Edit3,
  Eye,
  PenLine,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

type DiaryType = 'text' | 'voice' | 'handwriting';
type AnalysisState = 'idle' | 'analyzing' | 'completed';

interface DiaryEntryProps {
  onNavigateToChallenge?: () => void;
}

export function DiaryEntry({ onNavigateToChallenge }: DiaryEntryProps = {}) {
  const [showDiaryExistsModal, setShowDiaryExistsModal] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const showQuestion = isDailyQuestionEnabled();
  const [showQuestionSheet, setShowQuestionSheet] = useState(false);
  const [hasAnswer, setHasAnswer] = useState(false); // Mock: 답변 여부
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [pendingAnalysisPayload, setPendingAnalysisPayload] = useState(null);

  //해당 날짜의 일기 여부 확인
  const checkDiaryExists = async (year: string, month: string, day: string) => {
    year = String(year);
    month = String(month);
    day = String(day);

    const dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    try {
      const res = await api.get(`/api/diaries`, { params: { date: dateStr } });

      console.log("📌 checkDiaryExists 응답:", res.data);

      if (res.data && (res.data.id || res.data.content)) {
        setShowDiaryExistsModal(true);
        return true;
      }
      return false;
    } catch (err: any) {
      if (err.response?.status === 404) return false;
      console.error("일기 확인 오류:", err);
      return false;
    }
  };
  
  // localStorage에서 사용자 악기 가져오기
  const getCharacterType = (): 'PIANO' | 'GUITAR' | 'VIOLIN' | 'FLUTE' | 'MARIMBA' => {
    const profileData = localStorage.getItem('profileData');
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        return parsed.character || 'PIANO';
      } catch (e) {
        return 'PIANO';
      }
    }
    return 'PIANO';
  };
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [selectedDay, setSelectedDay] = useState(currentDay.toString());
  const selectedDateStr = `${selectedYear}-${selectedMonth.padStart(2, "0")}-${selectedDay.padStart(2, "0")}`;
  
  const [keywords, setKeywords] = useState<string[]>([]);
  const [userKeywords, setUserKeywords] = useState([]);
  
  const [todayQuestion, setTodayQuestion] = useState(null);

  const [diaryType, setDiaryType] = useState<DiaryType>('text');

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  
  const getAvailableMonths = () => {
    if (parseInt(selectedYear) === currentYear) {
      return Array.from({ length: currentMonth }, (_, i) => i + 1);
    }
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };
  const months = getAvailableMonths();
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const getAvailableDays = () => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const maxDays = getDaysInMonth(year, month);
    
    if (year === currentYear && month === currentMonth) {
      return Array.from({ length: currentDay }, (_, i) => i + 1);
    }
    return Array.from({ length: maxDays }, (_, i) => i + 1);
  };
  const days = getAvailableDays();

  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (
      !selectedYear ||
      !selectedMonth ||
      !selectedDay ||
      typeof selectedYear !== "string" ||
      typeof selectedMonth !== "string" ||
      typeof selectedDay !== "string"
    ) {
      return;
    }

    checkDiaryExists(selectedYear, selectedMonth, selectedDay);
  }, [selectedYear, selectedMonth, selectedDay]);

  // 오늘의 질문 가져오기
  useEffect(() => {
    api.get("/questions/today")
      .then(res => setTodayQuestion(res.data))
      .catch(() => setTodayQuestion(null));
  }, []);

  // 사용자 키워드 목록 가져오기
  useEffect(() => {
    api.get("/api/users/keywords")
      .then(res => {
        console.log("📌 키워드 API 응답:", res.data);
        setUserKeywords(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const toggleKeyword = (keyword: string) => {
    if (keywords.includes(keyword)) {
      setKeywords(keywords.filter(k => k !== keyword));
    } else {
      if (keywords.length >= 5) {
        toast.error('키워드는 최대 5개까지만 선택할 수 있습니다.');
        return;
      }
      setKeywords([...keywords, keyword]);
    }
  };

  const handleStartWriting = async () => {
    const exists = await checkDiaryExists(selectedYear, selectedMonth, selectedDay);

    if (exists) {
      return;
    }

    if (!selectedYear || !selectedMonth || !selectedDay) {
      toast.error('날짜를 선택해주세요.');
      return;
    }

    setIsWriting(true);
  };

  const handleSave = async (diary) => {
    try {
      const commonKeywords = Array.isArray(userKeywords)
        ? userKeywords.filter(kw => keywords.includes(kw.content)).map(kw => kw.id)
        : [];

      let payload;
      let res;

      if (diaryType === "text") {
        payload = {
          content: diary.content,
          date: selectedDateStr,
          keywordIds: commonKeywords,
          writeType: "TEXT"
        };
        res = await api.post("/api/diaries", payload);
      } 
      else if (diaryType === "voice") {
        payload = {
          content: diary.content,
          date: selectedDateStr,
          keywordIds: diary.keywordIds,
          emotionType: diary.emotionType,
          sttId: diary.sttId,
          writeType: "VOICE"
        };

        res = await api.post("/api/diaries/stt", payload);
      }
      else if (diaryType === "handwriting") {
        payload = {
          content: diary.content,
          date: selectedDateStr,
          keywordIds: commonKeywords,
          canvasImageBase64: diary.imageBase64 ?? null,
          writeType: "HANDWRITING"
        };

        res = await api.post("/api/diaries/canvas", payload);
      }

      const savedDiaryId = res.data.id;

      setPendingAnalysisPayload({
        diaryId: savedDiaryId,
        content: diary.content,
        date: selectedDateStr,
        keywordIds: payload.keywordIds
      });

      setAnalysisState("analyzing");

    } catch (err) {
      console.error(err);
      toast.error("일기 저장 실패");
    }
  };

  const handleAnalysisRetry = () => {
    if (!pendingAnalysisPayload) {
      toast.error("재시도할 데이터가 없습니다.");
      return;
    }
    
    setAnalysisState("analyzing");
  };

  const handleAnalysisBack = () => {
    // 분석 결과에서 돌아오기
    setAnalysisState('idle');
    setAnalysisResult(null);
    setKeywords([]);
    toast.success('일기가 저장되었습니다!');
  };

  const handleAcceptChallenge = () => {
    // 챌린지 탭으로 이동
    if (onNavigateToChallenge) {
      onNavigateToChallenge();
      toast.success('챌린지에 도전하셨어요! 🎯');
    }
  };

  const handleBack = () => {
    setIsWriting(false);
  };

  const handleOpenQuestionSheet = () => {
    setShowQuestionSheet(true);
  };

  const handleQuestionSaved = () => {
    setShowQuestionSheet(false);
    setHasAnswer(true);
    toast.success('답변이 저장되었습니다!');
  };

  // 분석 로딩 화면
  if (analysisState === 'analyzing') {
    return (
      <AnalysisLoading
        instrument="piano"
        payload={pendingAnalysisPayload}
        onRetry={handleAnalysisRetry}
        onComplete={(result) => {
          setAnalysisResult(result);
          setAnalysisState("completed");
        }}
      />
    );
  }

  // 분석 결과 화면
  if (analysisState === 'completed' && analysisResult) {
    return (
      <AnalysisResult
        result={analysisResult}
        instrument="piano"
        onAcceptChallenge={handleAcceptChallenge}
        characterType={getCharacterType()}
        onBack={handleAnalysisBack}
      />
    );
  }

  // 질문 답변 시트 화면
  if (showQuestionSheet) {
    return (
      <AnswerSheet
        question={todayQuestion}
        isEditMode={hasAnswer}
        existingAnswerId={hasAnswer ? 1 : null}
        onSave={handleQuestionSaved}
        onCancel={() => setShowQuestionSheet(false)}
      />
    );
  }

  // 일기 작성 화면
  if (isWriting) {
    if (diaryType === 'text') {
      return <TextDiaryWrite onBack={handleBack} onSave={handleSave} initialWriteType="TEXT" />;
    }
    
    if (diaryType === 'voice') {
      return (
        <STTTranscribe
          selectedDate={selectedDateStr}
          userKeywords={userKeywords}
          onBack={handleBack}

          onSave={(data) => {
            console.log("💙 부모 onSave 호출됨:", data);
            handleSave(data);
          }}

          onStartAnalysis={(analysisRequest) => {
            console.log("🟣 [DEBUG] --- DiaryEntry.onStartAnalysis ---");
            console.log("📨 전달받은 analysisRequest:", analysisRequest);

            console.log("📍 diaryId =", analysisRequest.diaryId);
            console.log("📍 text =", analysisRequest.text);
            console.log("📍 genreIds =", analysisRequest.genreIds);

            setPendingAnalysisPayload({
              diaryId: analysisRequest.diaryId,
              content: analysisRequest.text,
              date: selectedDateStr,
              keywordIds: analysisRequest.genreIds,
            });

            setAnalysisState('analyzing');
          }}
        />
      );
    }
    
    if (diaryType === 'handwriting') {
      return (
        <OCRPreview
          selectedDate={selectedDateStr}
          userKeywords={userKeywords}
          onBack={handleBack}

          onSave={async (data) => {
            await handleSave(data);
          }}

          onStartAnalysis={(analysisRequest) => {
            console.log("🟣 [DEBUG] --- DiaryEntry.onStartAnalysis ---");
            console.log("📨 전달받은 analysisRequest:", analysisRequest);

            console.log("📍 diaryId =", analysisRequest.diaryId);
            console.log("📍 text =", analysisRequest.text);
            console.log("📍 genreIds =", analysisRequest.genreIds);

            setPendingAnalysisPayload({
              diaryId: analysisRequest.diaryId,
              content: analysisRequest.text,
              date: selectedDateStr,
              keywordIds: analysisRequest.genreIds,
            });

            setAnalysisState('analyzing');
          }}
        />
      );
    }
  }

  return (
    <div className="min-h-screen p-4 pb-20 bg-background">
      {/* Header */}
      <div className="flex items-center justify-center mb-6">
        <h1 className="text-xl flex items-center gap-2 text-foreground">
          <Edit3 className="w-5 h-5" />
          일기 작성
        </h1>
      </div>

      {/* 1. 날짜 입력 */}
      <Card className="bg-card mb-4 border-border">
        <CardContent className="p-4">
          <Label className="text-sm mb-3 block text-foreground">
            날짜
          </Label>
          <div className="flex gap-2">
            <Select value={selectedYear} onValueChange={(v) => setSelectedYear(String(v))}>
              <SelectTrigger className="w-28 border-border">
                <SelectValue placeholder="년" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(String(v))}>
              <SelectTrigger className="w-24 border-border">
                <SelectValue placeholder="월" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month} value={month.toString()}>
                    {month}월
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDay} onValueChange={(v) => setSelectedDay(String(v))}>
              <SelectTrigger className="w-24 border-border">
                <SelectValue placeholder="일" />
              </SelectTrigger>
              <SelectContent>
                {days.map(day => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}일
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 2. 키워드 창 */}
      <Card className="bg-card mb-4 border-border">
        <CardContent className="p-4">
          <Label className="text-sm mb-3 block text-foreground">
            키워드 ({keywords.length}/5)
          </Label>
          
          {/* 선택된 키워드 */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              {keywords.map((keyword) => (
                <div
                  key={keyword}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-primary text-white"
                >
                  <span>{keyword}</span>
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 키워드 입력
          <div className="flex gap-2 mb-3">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="새 키워드 입력"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
              className="flex-1 border-border bg-background text-foreground"
              maxLength={10}
              disabled={keywords.length >= 5}
            />
            <Button
              onClick={handleAddKeyword}
              disabled={keywords.length >= 5 || !newKeyword.trim()}
              size="icon"
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div> */}

          {/* 미리 등록된 키워드 */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">등록된 키워드에서 선택</p>
            <div className="flex flex-wrap gap-2">
              {userKeywords
                .filter(kw => !keywords.includes(kw.content))
                .map((keyword) => (
                  <KeywordChip
                    key={keyword.id}
                    keyword={keyword.content}
                    selected={false}
                    onToggle={() => toggleKeyword(keyword.content)}
                    disabled={keywords.length >= 5}
                  />
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. 오늘의 질문 카드 - 설정에서 활성화된 경우에만 표시 */}
      {showQuestion && todayQuestion && (
        <Card className="bg-card mb-4 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm text-foreground">
                오늘의 질문
              </Label>
              <Badge 
                className="bg-primary text-white"
              >
                {todayQuestion.questionDay}일
              </Badge>
            </div>
            
            <div 
              className="p-3 rounded-lg mb-3 bg-primary/10"
            >
              <p className="text-sm leading-relaxed text-foreground">
                💡 {todayQuestion.content}
              </p>
            </div>

            {hasAnswer && (
              <div className="mb-3 p-3 rounded-lg bg-accent/10">
                <Badge 
                  variant="outline"
                  className="mb-2 border-primary text-primary"
                >
                  답변 완료
                </Badge>
                <p className="text-xs text-muted-foreground">
                  💡 하루에 한 번만 작성할 수 있어요. 수정은 10분간 가능합니다.
                </p>
              </div>
            )}

            <Button
              onClick={handleOpenQuestionSheet}
              className="w-full text-white"
              style={{ backgroundColor: hasAnswer ? '#5D3F35' : '#7B8B4F' }}
            >
              {hasAnswer ? (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  내 답변 보기
                </>
              ) : (
                <>
                  <PenLine className="w-4 h-4 mr-2" />
                  답변 작성하기
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 4. 일기 유형 창 */}
      <Card className="bg-card mb-6 border-border">
        <CardContent className="p-4">
          <Label className="text-sm mb-3 block text-foreground">
            일기 작성 방식
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={diaryType === 'text' ? 'default' : 'outline'}
              onClick={() => setDiaryType('text')}
              className={`flex flex-col h-20 gap-1 transition-colors ${
                diaryType === 'text' 
                  ? 'bg-primary text-white hover:bg-primary/90' 
                  : 'border-border text-foreground bg-background hover:bg-muted'
              }`}
            >
              <Type className="w-5 h-5" />
              <span className="text-xs">텍스트</span>
            </Button>
            <Button
              variant={diaryType === 'voice' ? 'default' : 'outline'}
              onClick={() => setDiaryType('voice')}
              className={`flex flex-col h-20 gap-1 transition-colors ${
                diaryType === 'voice' 
                  ? 'bg-primary text-white hover:bg-primary/90' 
                  : 'border-border text-foreground bg-background hover:bg-muted'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span className="text-xs">음성</span>
            </Button>
            <Button
              variant={diaryType === 'handwriting' ? 'default' : 'outline'}
              onClick={() => setDiaryType('handwriting')}
              className={`flex flex-col h-20 gap-1 transition-colors ${
                diaryType === 'handwriting' 
                  ? 'bg-primary text-white hover:bg-primary/90' 
                  : 'border-border text-foreground bg-background hover:bg-muted'
              }`}
            >
              <PenTool className="w-5 h-5" />
              <span className="text-xs">손글씨</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 5. 작성 시작하기 버튼 */}
      <div className="flex justify-center">
        <Button
          onClick={handleStartWriting}
          className="bg-accent text-white py-6 px-12 hover:bg-accent/90"
        >
          작성 시작하기
        </Button>
      </div>

      {showDiaryExistsModal && (
        <div
          className="error-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="error-modal-box"
            style={{
              width: "90%",
              maxWidth: "360px",
              background: "var(--card)",
              borderRadius: "16px",
              padding: "28px 22px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
              textAlign: "center",
              animation: "fadeInScale 0.25s ease-out",
            }}
          >
            <p
              className="error-modal-title"
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "8px",
                color: "var(--foreground)",
              }}
            >
              이미 작성된 일기
            </p>

            <p
              className="error-modal-subtext"
              style={{
                fontSize: "0.9rem",
                color: "var(--muted-foreground)",
                lineHeight: 1.5,
                marginBottom: "22px",
              }}
            >
              해당 날짜에는 이미 일기가 작성되어 있습니다.
            </p>

            <button
              className="error-modal-button"
              onClick={() => setShowDiaryExistsModal(false)}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                fontSize: "0.95rem",
                fontWeight: 500,
                transition: "all 0.15s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}