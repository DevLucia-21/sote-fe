import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Type, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { SimpleVoiceRecorder } from './SimpleVoiceRecorder';
import { AnalysisLoading } from '../analysis/AnalysisLoading';
import { AnalysisResult } from '../analysis/AnalysisResult';
import { AnalysisResult as AnalysisResultType, EmotionType } from '../analysis/types';
import {
  emotionReasons,
  emotionDescriptions,
} from '../analysis/mockData';

type DiaryType = 'text' | 'voice';
type AnalysisState = 'idle' | 'analyzing' | 'completed';

export function EasyDiaryEntry() {
  const [diaryType, setDiaryType] = useState<DiaryType>('text');
  const [content, setContent] = useState('');
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('일기 내용을 입력해주세요.');
      return;
    }

    // 분석 시작
    setAnalysisState('analyzing');
  };

  const handleAnalysisComplete = () => {
    // Mock 분석 결과 생성 (음악/챌린지 제외)
    const emotions: EmotionType[] = ['기쁨', '슬픔', '분노', '예민', '무기력'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    const reason = emotionReasons[randomEmotion][0];
    const description = emotionDescriptions[randomEmotion];

    const result: AnalysisResultType = {
      id: `analysis-${Date.now()}`,
      date: new Date().toISOString(),
      emotion: randomEmotion,
      confidence: Math.floor(Math.random() * 20) + 75,
      reason,
      description,
      // 음악과 챌린지는 제외
    };

    setAnalysisResult(result);
    setAnalysisState('completed');
  };

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

  // 분석 로딩 화면
  if (analysisState === 'analyzing') {
    return (
      <AnalysisLoading
        instrument="piano"
        onRetry={() => setAnalysisState('analyzing')}
        onComplete={handleAnalysisComplete}
      />
    );
  }

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
              placeholder={`오늘 있었던 일을
자유롭게 적어보세요...`}
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
            />
            {content && (
              <div className="mt-6">
                <p className="text-xl mb-3" style={{ color: '#4A3228' }}>
                  변환된 내용
                </p>
                <div 
                  className="p-6 rounded-lg text-xl leading-relaxed"
                  style={{ backgroundColor: '#F5F1E8', color: '#4A3228' }}
                >
                  {content}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

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
    </div>
  );
}