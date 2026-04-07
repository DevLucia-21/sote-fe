import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api'
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { KeywordChip } from './KeywordChip';
import { WriteType, EmotionType, Diary } from './types';
import { addDiaryEntry, mockDiaryData } from '../calendar/mockData';
import { AnalysisLoading } from '../analysis/AnalysisLoading';
import { AnalysisResult } from '../analysis/AnalysisResult';
import { AnalysisResult as AnalysisResultType } from '../analysis/types';
import {
  ArrowLeft,
  Type,
  Mic,
  PenTool,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Square,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface DiaryWriteProps {
  onBack?: () => void;
  onClose?: () => void;
  onSave?: (diary: Partial<Diary>) => void;
  editingDiary?: Diary;
  initialWriteType?: WriteType;
  date?: string; // YYYY-MM-DD format
  editMode?: boolean;
  isEasyMode?: boolean;
}

const reverseEmotionMap: Record<string, EmotionType> = {
  JOY: "기쁨",
  SADNESS: "슬픔",
  ANGER: "분노",
  APATHY: "무기력",
  SENSITIVE: "예민",
};

const emotionMap: Record<EmotionType, string> = {
  기쁨: "JOY",
  슬픔: "SADNESS",
  분노: "ANGER",
  화남: "ANGER",
  무기력: "APATHY",
  예민: "SENSITIVE",
};

const parseDateLocal = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDateLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function DiaryWrite({ onBack, onClose, onSave, editingDiary, initialWriteType, date: initialDate, editMode, isEasyMode }: DiaryWriteProps) {
  const [writeType, setWriteType] = useState<WriteType>(initialWriteType || editingDiary?.writeType || 'TEXT');
  const [date, setDate] = useState<Date>(
    initialDate 
      ? parseDateLocal(initialDate) 
      : editingDiary 
      ? parseDateLocal(editingDiary.date) 
      : new Date()
  );
  const [content, setContent] = useState(editingDiary?.content || '');
  const [userKeywords, setUserKeywords] = useState<{id: number; content: string;}[]>([]);
  const [emotionType, setEmotionType] = useState<EmotionType | null>(
    editingDiary ? reverseEmotionMap[editingDiary.emotionType] : null
  );
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(() => {
    if (!editingDiary?.keywords) return [];

    if (typeof editingDiary.keywords[0] === "string") {
      return editingDiary.keywords as string[];
    }

    return editingDiary.keywords.map((k: any) => k.content);
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(editingDiary?.imageUrl);
  const [sttStatus, setSttStatus] = useState<'idle' | 'recording' | 'processing' | 'success' | 'error'>('idle');
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [showMinLengthDialog, setShowMinLengthDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  
  // 음성 녹음 관련 상태
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);
  
  // 손글씨 캔버스 관련 상태
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ocrAllowed, setOcrAllowed] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const MINIMUM_LENGTH = 10;

  // Generate date options (오늘부터 30일 전까지)
  const dateOptions = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(new Date(), i);
    return {
      value: format(d, 'yyyy-MM-dd'),
      label: format(d, 'M월 d일 (E)', { locale: ko })
    };
  });

  const emotions: EmotionType[] = ['기쁨', '슬픔', '분노', '화남', '예민', '무기력'];

  // 캔버스 초기화 useEffect
  useEffect(() => {
    if (writeType === 'HANDWRITING') {
      setTimeout(() => initCanvas(), 100);
    }
  }, [writeType]);

  useEffect(() => {
    setDate(
      initialDate
        ? parseDateLocal(initialDate)
        : editingDiary
        ? parseDateLocal(editingDiary.date)
        : new Date()
    );
  }, [initialDate, editingDiary?.date]);

  // Helper function to check if diary exists for a date
  const getDiaryByDate = (dateStr: string) => {
    return mockDiaryData.find(d => d.date === dateStr);
  };

  const isFormValid = () => {
    if (!content.trim() || content.trim().length < 10) return false;
    // 키워드는 선택 사항
    return true;
  };

  const toggleKeyword = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      if (selectedKeywords.length >= 5) {
        toast.error('키워드는 최대 5개까지만 선택할 수 있습니다.');
        return;
      }
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  const handleDateSelect = (dateStr: string) => {
    const newDate = parseDateLocal(dateStr);

    // Check if future date
    if (newDate > new Date()) {
      toast.error('미래 일기는 작성할 수 없습니다.');
      return;
    }

    // Check if editing mode (can't change date)
    if (editingDiary) {
      toast.error('수정 시 날짜는 변경할 수 없습니다.');
      return;
    }

    // Check if diary already exists for this date
    const existingDiary = getDiaryByDate(dateStr);
    
    if (existingDiary) {
      toast.error('이미 작성한 일기가 있습니다.');
      return;
    }

    setDate(newDate);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('JPG 또는 PNG 파일만 업로드 가능합니다.');
      return;
    }

    setImageFile(file);
    setOcrStatus("processing");

    const reader = new FileReader();
    reader.onloadend = async () => {
      setImagePreview(reader.result as string);
      await sendToOCR(file);   // 🔥 여기서 바로 OCR 호출
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      toast.error("오디오 파일만 업로드 가능합니다.");
      return;
    }

    sendToSTT(file);  // ← ★ 업로드한 파일도 STT API로 바로 전송
  };

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await sendToSTT(blob); // ← ★ 바로 STT API 호출
      };

      setMediaRecorder(recorder);
      recorder.start();
      setSttStatus('recording');
      setRecordingTime(0);
      
      // 녹음 시간 카운터
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
      
      toast.success('녹음을 시작합니다.');
    } catch (error) {
      console.error('마이크 접근 실패:', error);
      toast.error('마이크 접근 권한이 필요합니다.');
      setSttStatus('error');
    }
  };

  // 음성 녹음 중지
  const stopRecording = () => {
    if (mediaRecorder?.state === "recording") {
      mediaRecorder.stop();
      clearInterval(recordingTimer!);
      setRecordingTimer(null);
      toast.success("녹음을 완료했습니다. 변환 중...");
    }
  };

  // 녹음 취소
  const cancelRecording = () => {
    if (mediaRecorder) {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
    }
    setSttStatus('idle');
    setRecordingTime(0);
    toast('녹음을 취소했습니다.');
  };

  // 실제 STT API 호출
  const sendToSTT = async (audioBlob: Blob) => {
    try {
      setSttStatus("processing");

      const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      const userId = Number(localStorage.getItem("user_id"));
      const diaryDate = new Date().toISOString().split("T")[0];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", userId.toString());
      formData.append("diary_date", diaryDate);
      formData.append("do_vad", "true");

      const res = await api.post("/ai/stt/transcribe", formData, {
        baseURL: "http://localhost:8080",
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("🟢 STT 응답:", res.data);

      const { text } = res.data;
      if (!text) {
        toast.error("변환된 텍스트가 비어 있습니다.");
        setSttStatus("error");
        return;
      }

      setContent(text);
      setSttStatus("success");

      toast.success("음성이 텍스트로 변환되었습니다!");

    } catch (err: any) {
      console.error("❌ STT 오류:", err);
      toast.error("음성 변환 중 오류가 발생했습니다.");
      setSttStatus("error");
    }
  };

  // 손글씨 캔버스 초기화
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2; // Retina 대응
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // 배경을 흰색으로 채우기
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 선 스타일 설정
    ctx.strokeStyle = '#4A3228';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  // 손글씨 그리기 시작
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // 손글씨 그리기
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // 손글씨 그리기 종료
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // 손글씨 캔버스 지우기
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setContent('');
    setOcrStatus('idle');
    toast('캔버스를 초기화했습니다.');
  };

  // 손글씨 인식 실행
  const recognizeHandwriting = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setOcrStatus("processing");

    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error("이미지 변환 실패");
        setOcrStatus("error");
        return;
      }

      // 프리뷰 업데이트
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(blob);

      await sendToOCR(blob);  // 🔥 canvas → OCR
    }, "image/png");
  };

  // 🔥 공통 OCR API 호출
  const sendToOCR = async (imageBlob: Blob) => {
    try {
      setOcrStatus("processing");

      const file = new File([imageBlob], `handwriting-${Date.now()}.png`, {
        type: "image/png",
      });

      const userId = Number(localStorage.getItem("user_id"));
      const diaryDate = new Date().toISOString().split("T")[0];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", String(userId));
      formData.append("diary_date", diaryDate);

      const res = await api.post("/api/ocr/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("🟢 OCR 응답:", res.data);

      const { text } = res.data;
      if (!text) {
        toast.error("인식된 텍스트가 없습니다.");
        setOcrStatus("error");
        return;
      }

      setContent(text);
      setOcrAllowed(true);  // OCR 사용 가능
      setOcrStatus("success");
      toast.success("손글씨가 텍스트로 변환되었습니다!");
    } catch (err) {
      if (err.response?.status === 403) {
        setOcrAllowed(false);   // 하루 횟수 초과
      }
      console.error("❌ OCR 오류:", err);
      toast.error("손글씨 인식 중 오류가 발생했습니다.");
      setOcrStatus("error");
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("일기 내용을 입력해주세요.");
      return;
    }

    if (content.trim().length < MINIMUM_LENGTH) {
      setShowMinLengthDialog(true);
      return;
    }

    // 백엔드가 요구하는 payload
    const payload = {
      date: editingDiary ? editingDiary.date : formatDateLocal(date),
      content: content.trim(),
      keywordIds: editingDiary
        ? editingDiary.keywordIds            // ← 수정 모드는 항상 기존 값 유지!
        : userKeywords
            .filter(kw => selectedKeywords.includes(kw.content))
            .map(kw => kw.id),
      emotionType: editingDiary
        ? editingDiary.emotionType          // ← 감정도 수정 불가 정책이면 고정
        : emotionType
            ? emotionMap[emotionType]
            : null,
    };

    console.group("📌 Diary Save Payload Debug");
    console.log("writeType:", writeType);
    console.log("date:", formatDateLocal(date));
    console.log("content:", content.trim());
    console.log("selectedKeywords:", selectedKeywords);
    console.log("userKeywords(raw):", userKeywords);
    console.log("keywordIds:", userKeywords
      .filter(kw => selectedKeywords.includes(kw.content))
      .map(kw => kw.id)
    );
    console.log("emotionType:", emotionType);
    console.log("payload:", payload);
    console.groupEnd();
    console.log("🔍 selectedKeywords:", selectedKeywords);
    console.log("🔍 editingDiary.keywords:", editingDiary?.keywords);

    try {
      setIsSaving(true);

      // ✨ 수정 모드 (PUT /api/diaries)
      if (editMode && editingDiary) {
        const res = await api.put("/api/diaries", payload);

        toast.success("일기가 수정되었습니다!");
        onSave?.(res.data);
        return;
      }

      // ✨ 새 일기 저장 (writeType 따라 URL 분기)
      let res;

      if (writeType === "TEXT") {
        res = await api.post("/api/diaries", payload);
      } 
      else if (writeType === "VOICE") {
        res = await api.post("/api/diaries/stt", payload);
      } 
      else if (writeType === "HANDWRITING") {

        // canvas로 작성한 경우 → BASE64 필요
        if (imagePreview && imagePreview.startsWith("data:image")) {
          res = await api.post("/api/diaries/canvas", {
            date: payload.date,
            content: content.trim(),
            canvasImageBase64: imagePreview, // 백엔드 요구 필드
            keywordIds: payload.keywordIds,
            emotionType: payload.emotionType,
          });
        } else {
          // 이미 업로드 이미지(OCR) 사용 → 일반 TEXT 저장으로 처리
          res = await api.post("/api/diaries", payload);
        }
      }

      toast.success("일기가 저장되었습니다!");
      onSave?.(res.data);

    } catch (e) {
      console.error("일기 저장 실패:", e);
      toast.error("일기 저장 중 문제가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="-ml-2 gap-1" disabled={isSaving || isAnalyzing}>
          <ArrowLeft className="w-4 h-4" />
          뒤로
        </Button>
        <h1 className="text-xl text-foreground">
          {editingDiary ? '일기 수정' : '일기 작성'}
        </h1>
        <div className="w-16"></div>
      </div>

      {/* Date Picker */}
      <Card className="bg-card mb-4 border-border">
        <CardContent className="p-4">
          <Label className="text-sm mb-2 block text-foreground">
            날짜 {editingDiary && <span className="text-xs text-muted-foreground">(변경 불가)</span>}
          </Label>
          <Select
            value={format(date, 'yyyy-MM-dd')}
            onValueChange={(v) => handleDateSelect(v)}
            disabled={!!editingDiary}
          >
            <SelectTrigger className="w-full border-border">
              <SelectValue>
                {format(date, 'PPP', { locale: ko })}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Keywords */}
      {!isEasyMode && (
        <Card className="bg-card mb-4 border-border">
          <CardContent className="p-4">
            <Label className="text-sm mb-2 block text-foreground">
              키워드 ({selectedKeywords.length}/5) 
              {editingDiary && <span className="text-xs text-muted-foreground ml-1">(변경 불가)</span>}
            </Label>

            {/* 선택된 키워드 */}
            {selectedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                {selectedKeywords.map((keyword) => (
                  <div
                    key={keyword}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-primary text-white"
                  >
                    <span>{keyword}</span>

                    {/* 수정 모드일 때는 삭제버튼 없앰 */}
                    {!editingDiary && (
                      <button
                        onClick={() => toggleKeyword(keyword)}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 등록된 키워드에서 선택 (수정 모드에서는 숨김) */}
            {!editingDiary && (
              <div className="space-y-2 max-w-full">
                <p className="text-xs text-muted-foreground">등록된 키워드에서 선택</p>

                <div className="flex flex-wrap gap-2">
                  {userKeywords
                    .filter(kw => !selectedKeywords.includes(kw.content))
                    .map(kw => (
                      <KeywordChip
                        key={kw.id}
                        keyword={kw.content}
                        selected={selectedKeywords.includes(kw.content)}
                        onToggle={() => toggleKeyword(kw.content)}
                        disabled={selectedKeywords.length >= 5}
                      />
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Write Type Tabs */}
      <Card className="bg-card mb-4 border-border">
        <CardContent className="p-4">
          <Tabs value={writeType} onValueChange={(v) => setWriteType(v as WriteType)}>
            <TabsList className={`w-full grid ${isEasyMode ? 'grid-cols-2' : 'grid-cols-3'}`}>
              <TabsTrigger value="TEXT" className="gap-1">
                <Type className="w-4 h-4" />
                텍스트
              </TabsTrigger>
              <TabsTrigger value="VOICE" className="gap-1">
                <Mic className="w-4 h-4" />
                음성
              </TabsTrigger>
              {!isEasyMode && (
                <TabsTrigger value="HANDWRITING" className="gap-1">
                  <PenTool className="w-4 h-4" />
                  손글씨
                </TabsTrigger>
              )}
            </TabsList>

            {/* TEXT Tab */}
            <TabsContent value="TEXT" className="mt-4 space-y-4">
              <div>
                <Label className="text-sm mb-2 block text-foreground">
                  일기 내용
                </Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="오늘 하루는 어땠나요? 자유롭게 작성해보세요..."
                  className="min-h-[200px] border border-border resize-none bg-background text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {content.length}자
                </p>
              </div>
            </TabsContent>

            {/* STT Tab */}
            <TabsContent value="VOICE" className="mt-4 space-y-4">
              <div>
                <Label className="text-sm mb-2 block text-foreground">
                  음성 녹음
                </Label>
                
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />

                {sttStatus === 'idle' && (
                  <div className="space-y-2">
                    <Button
                      onClick={startRecording}
                      variant="outline"
                      className="w-full h-32 flex flex-col gap-2 border-2 border-primary/30 hover:border-primary hover:bg-primary/5"
                    >
                      <Mic className="w-8 h-8 text-primary" />
                      <span className="text-foreground">음성 녹음 시작</span>
                    </Button>
                    {!isEasyMode && (
                      <>
                        <div className="text-center text-xs text-muted-foreground">
                          또는
                        </div>
                        <Button
                          onClick={() => audioInputRef.current?.click()}
                          variant="outline"
                          className="w-full h-24 flex flex-col gap-2"
                        >
                          <Upload className="w-6 h-6 text-primary" />
                          <span className="text-foreground">음성 파일 업로드</span>
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {sttStatus === 'recording' && (
                  <div className="w-full border-2 border-primary rounded-lg p-6">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
                          <Mic className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      <p className="text-sm text-primary">녹음 중...</p>
                      <p className="text-2xl text-primary">
                        {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                      </p>
                      <div className="flex gap-2 w-full mt-2">
                        <Button
                          onClick={stopRecording}
                          className="flex-1 bg-primary text-white hover:bg-primary/90"
                        >
                          <Square className="w-4 h-4 mr-1" />
                          중지
                        </Button>
                        <Button
                          onClick={cancelRecording}
                          variant="outline"
                          className="flex-1"
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {sttStatus === 'processing' && (
                  <div className="w-full h-32 border border-border rounded-lg flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-primary">음성을 변환하고 있습니다...</p>
                  </div>
                )}

                {sttStatus === 'success' && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg flex items-center justify-between gap-2 bg-primary/10">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <p className="text-sm text-primary">변환 완료</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSttStatus("idle")}>
                        다시 녹음
                      </Button>
                    </div>

                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[150px] border border-border resize-none"
                    />
                  </div>
                )}

                {sttStatus === 'error' && (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg flex items-center gap-2 bg-red-50 dark:bg-red-950/20">
                      <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                      <p className="text-sm text-red-600 dark:text-red-400">녹음 실패: 녹음은 하루에 한 번만 분석 가능합니다.</p>
                    </div>
                    <Button
                      onClick={() => setSttStatus('idle')}
                      variant="outline"
                      className="w-full"
                    >
                      다시 시도
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* OCR Tab */}
            <TabsContent value="HANDWRITING" className="mt-4 space-y-4">
              <div>
                <Label className="text-sm mb-2 block text-foreground">
                  손글씨 작성
                </Label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {ocrAllowed ? (
                  <div className="space-y-2">
                    {/* 캔버스 */}
                    <div className="relative border-2 border-border rounded-lg overflow-hidden bg-white">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-64 cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        onLoad={initCanvas}
                      />
                    </div>

                    {/* 캔버스 버튼 */}
                    <div className="flex gap-2">
                      <Button
                        onClick={clearCanvas}
                        variant="outline"
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        지우기
                      </Button>

                      <Button
                        onClick={recognizeHandwriting}
                        className="flex-1 bg-primary text-white hover:bg-primary/90"
                      >
                        <PenTool className="w-4 h-4 mr-1" />
                        인식하기
                      </Button>
                    </div>

                    <div className="text-center text-xs text-muted-foreground">또는</div>

                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full h-24 flex flex-col gap-2"
                    >
                      <Upload className="w-6 h-6 text-primary" />
                      <span className="text-foreground">이미지 업로드</span>
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-sm text-red-500 py-6">
                    손글씨는 하루에 한 번만 분석 가능합니다.
                  </p>
                )}

                {ocrStatus === 'processing' && (
                  <div className="w-full h-32 border border-border rounded-lg flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-primary">손글씨를 인식하고 있습니다...</p>
                  </div>
                )}

                {ocrStatus === 'success' && imagePreview && (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Handwriting"
                        className="w-full rounded-lg border border-border"
                      />
                      <Button
                        onClick={() => {
                          setImagePreview(undefined);
                          setImageFile(null);
                          setContent('');
                          setOcrStatus('idle');
                          initCanvas();
                        }}
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="p-3 rounded-lg flex items-center justify-between gap-2 bg-primary/10">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <p className="text-sm text-primary">인식 완료</p>
                      </div>
                      <Button
                        onClick={() => {
                          setImagePreview(undefined);
                          setContent('');
                          setOcrStatus('idle');
                          initCanvas();
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        다시 작성
                      </Button>
                    </div>
                    
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[150px] border border-border resize-none bg-background text-foreground"
                      placeholder="인식된 내용을 수정할 수 있습니다..."
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {content.trim().length > 0 && content.trim().length < MINIMUM_LENGTH && (
        <p className="text-center text-red-500 text-sm mb-2">
          최소 {MINIMUM_LENGTH}자 이상 작성해주세요. ({content.trim().length}자)
        </p>
      )}

      {/* 저장 버튼 */}
      <div className="flex justify-center mb-4">
        <Button
          onClick={handleSave}
          disabled={!isFormValid() || isSaving || isAnalyzing}
          className="px-12 py-6 text-lg"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              저장중...
            </>
          ) : isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              분석중...
            </>
          ) : (
            '저장하기'
          )}
        </Button>
      </div>

      {/* Edit Info Card */}
      {editingDiary && !editMode && !isEasyMode && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 일기를 수정하면 감정 재분석이 자동으로 진행됩니다.
            </p>
          </CardContent>
        </Card>
      )}

      {/* 분석 로딩 중 */}
      {isAnalyzing && !isEasyMode && <AnalysisLoading />}

      {/* 분석 결과 */}
      {analysisResult && !isEasyMode && <AnalysisResult result={analysisResult} />}

      {/* 최소 글자 수 미달 다이얼로그 */}
      <Dialog open={showMinLengthDialog} onOpenChange={setShowMinLengthDialog}>
        <DialogContent className="border-border">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-50 dark:bg-yellow-950/20">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <DialogTitle className="text-center text-foreground">
              내용을 더 작성해주세요
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              일기 내용이 너무 짧습니다.<br />
              최소 {MINIMUM_LENGTH}자 이상 작성해주세요.<br />
              <span className="text-primary">(현재 {content.trim().length}자)</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowMinLengthDialog(false)}
              className="w-full bg-primary text-white hover:bg-primary/90"
            >
              계속 작성하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
