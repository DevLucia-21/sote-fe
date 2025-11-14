import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Question, Answer, CreateAnswerRequest, UpdateAnswerRequest } from './types';

interface AnswerSheetProps {
  question: Question;
  isEditMode: boolean;
  existingAnswerId?: number | null;
  onSave: () => void;
  onCancel: () => void;
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export function AnswerSheet({ question, isEditMode, existingAnswerId, onSave, onCancel }: AnswerSheetProps) {
  const [answerText, setAnswerText] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // 수정 모드일 때 남은 시간
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [canEdit, setCanEdit] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const minLength = 5;
  const isValid = answerText.trim().length >= minLength;

  useEffect(() => {
    if (isEditMode && existingAnswerId) {
      loadExistingAnswer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isEditMode, existingAnswerId]);

  useEffect(() => {
    if (remainingSeconds !== null && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev === null || prev <= 1) {
            setCanEdit(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            toast.error('수정 가능 시간이 만료되었습니다.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [remainingSeconds]);

  const loadExistingAnswer = async () => {
    try {
      // Mock API: GET /api/questions/answers/{answerId}
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock existing answer
      const mockAnswer: Answer = {
        id: existingAnswerId!,
        questionId: question.id,
        questionContent: question.content,
        questionDay: question.questionDay,
        answerText: '오늘은 정말 좋은 하루였어요. 친구를 만나서 맛있는 음식을 먹고 즐거운 대화를 나눴습니다.',
        answeredAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5분 전
        answerMonth: new Date().toISOString().substring(0, 7) + '-01',
      };

      setAnswerText(mockAnswer.answerText);

      // 수정 가능 시간 계산 (10분 = 600초)
      const answeredTime = new Date(mockAnswer.answeredAt).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - answeredTime) / 1000);
      const remaining = 600 - elapsedSeconds; // 10분 = 600초

      if (remaining > 0) {
        setRemainingSeconds(remaining);
        setCanEdit(true);
      } else {
        setRemainingSeconds(0);
        setCanEdit(false);
      }
    } catch (error) {
      console.error('기존 답변 로딩 실패:', error);
      toast.error('답변을 불러올 수 없습니다.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!isValid) {
      toast.error(`최소 ${minLength}자 이상 작성해주세요.`);
      return;
    }

    if (isEditMode && !canEdit) {
      toast.error('작성 후 10분이 지나 수정할 수 없어요.');
      return;
    }

    setSaveStatus('saving');

    try {
      if (isEditMode && existingAnswerId) {
        // Mock API: PUT /api/questions/answers/{answerId}
        const updateRequest: UpdateAnswerRequest = {
          answerText: answerText.trim(),
        };

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock: 수정 제한 시간 체크 (서버에서도 체크)
        if (!canEdit) {
          throw new Error('FORBIDDEN');
        }

        console.log('답변 수정:', updateRequest);
      } else {
        // Mock API: POST /api/questions/{qid}/answers
        const createRequest: CreateAnswerRequest = {
          answerText: answerText.trim(),
        };

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock: 중복 작성 체크 (서버에서 409 응답)
        // 실제로는 매우 낮은 확률로 중복 발생
        if (Math.random() < 0.1) {
          throw new Error('CONFLICT');
        }

        console.log('답변 작성:', createRequest);
      }

      setSaveStatus('success');
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('답변 저장 실패:', error);
      setSaveStatus('error');

      if (error.message === 'CONFLICT') {
        setErrorMessage('이번 달에 이미 작성했어요');
      } else if (error.message === 'FORBIDDEN') {
        setErrorMessage('작성 후 10분이 지나 수정할 수 없어요');
      } else {
        setErrorMessage('지금은 처리할 수 없어요. 잠시 후 다시 시도해 주세요.');
      }
      setShowErrorDialog(true);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessDialog(false);
    onSave();
  };

  return (
    <div className="min-h-screen p-4 pb-20 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl text-foreground">
          {isEditMode ? '답변 수정' : '답변 작성'}
        </h1>
        <div className="w-9" />
      </div>

      {/* Question Card */}
      <Card className="bg-card mb-4 border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-primary text-white">
              {question.questionDay}일
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-foreground">
            {question.content}
          </p>
        </CardContent>
      </Card>

      {/* Edit Time Warning */}
      {isEditMode && remainingSeconds !== null && (
        <Card 
          className={`mb-4 ${
            canEdit 
              ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800' 
              : 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800'
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 shrink-0 ${canEdit ? 'text-orange-500' : 'text-red-500'}`} />
              <div className="flex-1">
                {canEdit ? (
                  <p className="text-xs text-foreground">
                    수정 가능 시간: <strong>{formatTime(remainingSeconds)}</strong>
                  </p>
                ) : (
                  <p className="text-xs text-foreground">
                    작성 후 10분이 지나 수정할 수 없어요
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hint */}
      {!isEditMode && (
        <Card className="mb-4 bg-primary/10 border-primary">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">
              💡 하루에 한 번만 작성할 수 있어요. 수정은 10분간 가능합니다.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Answer Input */}
      <Card className="bg-card mb-4 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-foreground">
              내 답변
            </Label>
            <span 
              className={`text-xs ${isValid ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {answerText.length}자 {!isValid && `(최소 ${minLength}자)`}
            </span>
          </div>
          <Textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={isEditMode && !canEdit}
            className="min-h-[200px] border border-border resize-none bg-background text-foreground"
            placeholder="오늘의 질문에 대한 답변을 자유롭게 작성해주세요..."
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={saveStatus === 'saving'}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          onClick={handleSave}
          disabled={!isValid || saveStatus === 'saving' || (isEditMode && !canEdit)}
          className="flex-1 bg-primary text-white hover:bg-primary/90"
        >
          {saveStatus === 'saving' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            '저장하기'
          )}
        </Button>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="border-border">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center text-foreground">
              저장 완료
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              저장했어요
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleSuccessConfirm}
              className="w-full bg-primary text-white hover:bg-primary/90"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="border-border">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <DialogTitle className="text-center text-foreground">
              저장 실패
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowErrorDialog(false)}
              className="w-full bg-accent text-white hover:bg-accent/90"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}