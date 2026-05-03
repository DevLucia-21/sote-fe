import React, { useState, useEffect } from 'react';
import api from "../../services/api";
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Type, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { SimpleVoiceRecorder } from './SimpleVoiceRecorder';
import { AnalysisLoading } from '../analysis/AnalysisLoading';
import { AnalysisResult, hasValidAnalysis, normalizeAnalysisResult } from '../analysis/AnalysisResult';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";

type DiaryType = 'text' | 'voice';

export function EasyDiaryEntry() {
  const [diaryType, setDiaryType] = useState<DiaryType>('text');
  const [content, setContent] = useState('');
  const [analysisState, setAnalysisState] = useState('idle');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [pendingAnalysisPayload, setPendingAnalysisPayload] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [lengthWarning, setLengthWarning] = useState(false);
  const [sttLimitWarning, setSttLimitWarning] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  // useEffect(() => { 
  //   const checkTodayDiary = async () => {
  //     try {
  //       const res = await api.get('/api/diaries', { params: { date: todayStr } });
  //       const todayDiary = res.data;

  //       if (todayDiary) {
  //         setShowWarningModal(true);
  //       }
  //     } catch (err) {
  //       console.error("오늘 일기 조회 실패:", err);
  //     }
  //   };

  //   checkTodayDiary();
  // }, [todayStr]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("일기 내용을 입력해주세요.");
      return;
    }

    if (content.trim().length < 10) {
      setLengthWarning(true);   // 🔥 경고 표시
      return;
    }
    setLengthWarning(false);

    try {
      const savePayload = {
        content: content.trim(),
        date: todayStr,
        keywordIds: [],
        emotionType: null,
      };

      let res;
      if (diaryType === "text") {
        res = await api.post("/api/diaries", savePayload);
      } else {
        const token = localStorage.getItem("accessToken");
        res = await api.post(
          "/api/diaries/stt",
          savePayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const savedDiary = res.data;
      
      // 🔥 DiaryEntry와 동일: 분석 요청을 AnalysisLoading이 담당하게 넘김
      setPendingAnalysisPayload({
        diaryId: savedDiary.id,
        text: savePayload.content,
        genreIds: [], // Easy 모드에서는 항상 비어 있음
      });

      setAnalysisState("analyzing");
      
    } catch (err: any) {
      // 🔥 STT 하루 1회 제한(403)
      if (err?.response?.status === 403 && diaryType === "voice") {
        setSttLimitWarning(true);
        return;
      }
      toast.error("일기 저장 중 문제가 발생했습니다.");
      console.error(err);
    }
  };

  if (analysisState === "analyzing") {
    return (
      <AnalysisLoading
        payload={pendingAnalysisPayload}
        instrument="piano"
        onRetry={() => setAnalysisState("analyzing")}
        onComplete={(result) => {
          const normalizedResult = normalizeAnalysisResult(result);

          if (hasValidAnalysis(normalizedResult)) {
            setAnalysisResult(normalizedResult);
            setAnalysisState("completed");
          } else {
            setAnalysisResult(null);
            setAnalysisState("idle");
            toast.info("일기는 저장되었고, 분석 결과는 표시하지 않을게요.");
          }
        }}
      />
    );
  }

  if (analysisState === "completed" && analysisResult) {
    return (
      <AnalysisResult
        result={analysisResult}
        instrument="piano"
        onBack={() => {
          setAnalysisState("idle");
          setAnalysisResult(null);
          setContent("");
          toast.success("일기가 저장되었습니다!");
        }}
        onAcceptChallenge={() => {}}
      />
    );
  }

  const handleAnalysisBack = () => {
    setAnalysisState('idle');
    setAnalysisResult(null);
    setContent('');
    setDiaryType('text');
    toast.success('일기가 저장되었습니다!');
  };

  const handleReset = () => {
    setContent('');
    setAnalysisState('idle');
    setAnalysisResult(null);
    setDiaryType('text');
  };

  // 분석 완료 화면
  if (analysisState === 'completed' && analysisResult) {
    return (
      <AnalysisResult
        result={analysisResult}
        onBack={handleAnalysisBack}
        onAcceptChallenge={() => {}} // 챌린지 기능 제거
      />
    );
  }

  // 일기 작성 화면
  return (
    <div className="p-6 space-y-6 min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
      <h1 className="text-4xl" style={{ color: '#4A3228' }}>
        오늘의 일기 작성
      </h1>

      {/* 입력 방식 선택 */}
      <Card className="p-6" style={{ backgroundColor: 'white', borderColor: '#E5E5E5' }}>
        <p className="text-xl mb-4" style={{ color: '#4A3228' }}>
          작성 방법을 선택하세요
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <button
            onClick={() => setDiaryType('text')}
            className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-xl transition-all aspect-[4/3]"
            style={{
              backgroundColor: diaryType === 'text' ? '#7B8B4F' : '#F5F1E8',
              color: diaryType === 'text' ? 'white' : '#4A3228',
              border: `2px solid ${diaryType === 'text' ? '#7B8B4F' : '#E5E5E5'}`,
            }}
          >
            <Type className="w-12 h-12" />
            <span className="text-lg">글자 입력</span>
          </button>

          <button
            onClick={() => setDiaryType('voice')}
            className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-xl transition-all aspect-[4/3]"
            style={{
              backgroundColor: diaryType === 'voice' ? '#7B8B4F' : '#F5F1E8',
              color: diaryType === 'voice' ? 'white' : '#4A3228',
              border: `2px solid ${diaryType === 'voice' ? '#7B8B4F' : '#E5E5E5'}`,
            }}
          >
            <Mic className="w-12 h-12" />
            <span className="text-lg">음성 입력</span>
          </button>
        </div>
      </Card>

      {/* 입력 영역 */}
      <Card className="p-6" style={{ backgroundColor: 'white', borderColor: '#E5E5E5' }}>
        {diaryType === 'text' && (
          <div className="space-y-4">
            <p className="text-xl" style={{ color: '#4A3228' }}>
              오늘 하루는 어떠셨나요?
            </p>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`오늘 있었던 일을 자유롭게 적어보세요...`}
              className="min-h-[300px] text-xl p-6 resize-none"
              style={{ 
                backgroundColor: '#F5F1E8',
                borderColor: '#E5E5E5',
                color: '#4A3228',
                fontSize: '1.25rem',
                lineHeight: '1.8'
              }}
            />
          </div>
        )}

        {diaryType === 'voice' && (
          <div className="space-y-4">
            <p className="text-2xl mb-4" style={{ color: '#4A3228' }}>
              마이크 버튼을 눌러<br />말씀해주세요
            </p>
            <SimpleVoiceRecorder
              onTranscriptComplete={(text) => {
                setContent(text);
                toast.success('음성이 텍스트로 변환되었습니다.');
              }}
              onError={(err) => {
                if (err?.response?.status === 403) {
                  setSttLimitWarning(true);
                }
              }}
            />
            {content && (
              <div className="mt-6">
                <p className="text-xl mb-3" style={{ color: '#4A3228' }}>
                  변환된 내용 (수정 가능)
                </p>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="변환된 텍스트를 직접 수정할 수 있어요"
                  className="min-h-[200px] text-xl p-6 resize-none"
                  style={{
                    backgroundColor: '#F5F1E8',
                    borderColor: '#E5E5E5',
                    color: '#4A3228',
                    fontSize: '1.25rem',
                    lineHeight: '1.8'
                  }}
                />
              </div>
            )}
          </div>
        )}
      </Card>
      {lengthWarning && (
        <p className="text-red-600 text-center text-lg font-medium">
          일기는 10자 이상 작성해야 저장할 수 있어요.
        </p>
      )}
      {sttLimitWarning && (
        <p className="text-red-600 text-center text-lg font-medium">
          음성 변환은 하루 1회만 사용할 수 있어요.<br />
          텍스트 입력을 이용해주세요.
        </p>
      )}
      {/* 제출 버튼 */}
      <Button
        onClick={handleSubmit}
        disabled={!content.trim()}
        className="w-full text-2xl py-8"
        style={{ 
          backgroundColor: content.trim() ? '#7B8B4F' : '#C8C8C8',
          color: 'white',
          cursor: content.trim() ? 'pointer' : 'not-allowed'
        }}
      >
        일기 완성하기
      </Button>

      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>오늘 일기가 이미 있어요</DialogTitle>
            <DialogDescription>
              이미 작성된 일기가 있습니다. 더 작성하실 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-3">
            <Button
              onClick={() => setShowWarningModal(false)}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
