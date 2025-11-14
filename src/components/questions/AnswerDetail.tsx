import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArrowLeft, Edit, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Answer } from './types';
import { AnswerSheet } from './AnswerSheet';
import { getQuestionById } from './mockData';

interface AnswerDetailProps {
  answer: Answer;
  onClose: () => void;
  onRefresh: () => void;
}

export function AnswerDetail({ answer, onClose, onRefresh }: AnswerDetailProps) {
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    calculateEditTime();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [answer]);

  useEffect(() => {
    if (remainingSeconds !== null && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev === null || prev <= 1) {
            setCanEdit(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
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

  const calculateEditTime = () => {
    const answeredTime = new Date(answer.answeredAt).getTime();
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
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const handleEdit = () => {
    if (!canEdit) {
      toast.error('작성 후 10분이 지나 수정할 수 없어요.');
      return;
    }
    setShowEditSheet(true);
  };

  const handleEditComplete = () => {
    setShowEditSheet(false);
    onRefresh();
    onClose();
  };

  if (showEditSheet) {
    const question = getQuestionById(answer.questionId);
    if (!question) return null;

    return (
      <AnswerSheet
        question={question}
        isEditMode={true}
        existingAnswerId={answer.id}
        onSave={handleEditComplete}
        onCancel={() => setShowEditSheet(false)}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={onClose}
          className="p-2 text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl text-foreground">
          답변 상세
        </h1>
        <div className="w-9" />
      </div>

      {/* Question Card */}
      <Card className="bg-card mb-4 border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge 
              className="text-white"
              style={{ backgroundColor: '#7B8B4F' }}
            >
              {answer.questionDay}일
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-foreground">
            {answer.questionContent}
          </p>
        </CardContent>
      </Card>

      {/* Edit Time Info */}
      {remainingSeconds !== null && (
        <Card 
          className="mb-4 border"
          style={{ 
            backgroundColor: canEdit ? '#FFF7ED' : 'var(--card)', 
            borderColor: canEdit ? '#FB923C' : 'var(--border)' 
          }}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" style={{ color: canEdit ? '#FB923C' : 'var(--muted-foreground)' }} />
              <div className="flex-1">
                {canEdit ? (
                  <p className="text-xs" style={{ color: canEdit ? '#4A3228' : 'var(--foreground)' }}>
                    수정 가능 시간: <strong>{formatTime(remainingSeconds)}</strong>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    작성 후 10분이 지나 수정할 수 없어요
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Answer Content */}
      <Card className="bg-card mb-4 border-border">
        <CardContent className="p-4">
          <div className="mb-4">
            <p className="text-sm mb-3 text-foreground">
              내 답변
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {answer.answerText}
            </p>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-border space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>작성: {formatDateTime(answer.answeredAt)}</span>
            </div>
            {answer.updatedAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Edit className="w-3.5 h-3.5" />
                <span>수정: {formatDateTime(answer.updatedAt)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleEdit}
          disabled={!canEdit}
          className="w-full text-white"
          style={{ backgroundColor: canEdit ? '#7B8B4F' : '#E5E5E5' }}
        >
          <Edit className="w-4 h-4 mr-2" />
          수정하기
        </Button>

        <Button
          variant="outline"
          onClick={onClose}
          className="w-full border-border text-foreground"
        >
          닫기
        </Button>
      </div>
    </div>
  );
}