import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { RefreshCw, Loader2, AlertCircle, PenLine, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Question, AnswerExistResponse } from './types';
import { getTodayQuestion } from './mockData';
import { AnswerSheet } from './AnswerSheet';

type ViewStatus = 'loading' | 'success' | 'empty' | 'error';

export function TodayQuestion() {
  const [status, setStatus] = useState<ViewStatus>('loading');
  const [question, setQuestion] = useState<Question | null>(null);
  const [hasAnswer, setHasAnswer] = useState(false);
  const [existingAnswerId, setExistingAnswerId] = useState<number | null>(null);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadTodayQuestion();
  }, []);

  const loadTodayQuestion = async () => {
    setStatus('loading');
    try {
      // Mock API: GET /questions/today
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const todayQuestion = getTodayQuestion();
      setQuestion(todayQuestion);

      // Mock API: GET /api/questions/{qid}/answers/me/exist?month=yyyy-MM
      await checkAnswerExists(todayQuestion.id);

      setStatus('success');
    } catch (error) {
      console.error('오늘의 질문 로딩 실패:', error);
      setStatus('error');
      toast.error('지금은 처리할 수 없어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const checkAnswerExists = async (questionId: number) => {
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Mock API: GET /api/questions/{qid}/answers/me/exist?month=yyyy-MM
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock data - 랜덤으로 답변 존재 여부 결정 (실제로는 API 응답 사용)
      const mockExists = Math.random() > 0.7;
      const mockAnswerId = mockExists ? Math.floor(Math.random() * 1000) : null;
      
      setHasAnswer(mockExists);
      setExistingAnswerId(mockAnswerId);
    } catch (error) {
      console.error('답변 존재 확인 실패:', error);
    }
  };

  const handleRefresh = () => {
    loadTodayQuestion();
  };

  const handleWriteAnswer = () => {
    setIsEditMode(false);
    setShowAnswerSheet(true);
  };

  const handleViewOrEditAnswer = () => {
    setIsEditMode(true);
    setShowAnswerSheet(true);
  };

  const handleAnswerSaved = () => {
    setShowAnswerSheet(false);
    loadTodayQuestion(); // 답변 상태 다시 확인
  };

  const handleAnswerCancel = () => {
    setShowAnswerSheet(false);
  };

  if (showAnswerSheet && question) {
    return (
      <AnswerSheet
        question={question}
        isEditMode={isEditMode}
        existingAnswerId={existingAnswerId}
        onSave={handleAnswerSaved}
        onCancel={handleAnswerCancel}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl text-foreground">
          오늘의 질문
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={status === 'loading'}
          className="p-2"
        >
          <RefreshCw className={`w-5 h-5 ${status === 'loading' ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Loading State */}
      {status === 'loading' && (
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                오늘의 질문을 불러오는 중...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {status === 'success' && question && (
        <div className="space-y-4">
          {/* Question Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              {/* Day Badge */}
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-primary text-white">
                  {question.questionDay}일
                </Badge>
                {hasAnswer && (
                  <Badge variant="outline" className="border-primary text-primary">
                    답변 완료
                  </Badge>
                )}
              </div>

              {/* Question Content */}
              <p className="text-lg mb-6 leading-relaxed text-foreground">
                {question.content}
              </p>

              {/* Hint */}
              {!hasAnswer && (
                <div className="mb-4 p-3 rounded-lg bg-primary/10">
                  <p className="text-xs text-muted-foreground">
                    💡 한 달에 한 번만 답변할 수 있어요
                  </p>
                </div>
              )}

              {/* Action Button */}
              {!hasAnswer ? (
                <Button
                  onClick={handleWriteAnswer}
                  className="w-full bg-primary text-white hover:bg-primary/90"
                >
                  <PenLine className="w-4 h-4 mr-2" />
                  답변 작성하기
                </Button>
              ) : (
                <Button
                  onClick={handleViewOrEditAnswer}
                  className="w-full bg-accent text-white hover:bg-accent/90"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  내 답변 보기
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm mb-2 text-foreground">
                📝 이번 달에 작성한 답변
              </p>
              <p className="text-xs text-muted-foreground">
                월별 답변 탭에서 지난 답변들을 확인할 수 있어요
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {status === 'empty' && (
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 mb-4 text-muted" />
              <p className="text-sm mb-2 text-foreground">
                아직 오늘의 질문이 없어요
              </p>
              <p className="text-xs text-muted-foreground">
                잠시 후 다시 확인해주세요
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {status === 'error' && (
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
              <p className="text-sm mb-2 text-foreground">
                질문을 불러올 수 없어요
              </p>
              <p className="text-xs mb-4 text-muted-foreground">
                지금은 처리할 수 없어요. 잠시 후 다시 시도해 주세요.
              </p>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
              >
                다시 시도
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
