import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArrowLeft, Loader2, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Answer } from './types';
import { MOCK_QUESTIONS, getMockAnswer } from './mockData';
import { AnswerDetail } from './AnswerDetail';
//import { useTheme } from '../providers/ThemeProvider';

interface DayAnswerHistoryProps {
  day: number;
  month: string;
  onClose: () => void;
  onRefresh?: () => void;
}

type ViewStatus = 'loading' | 'success' | 'empty' | 'error';

interface MonthAnswer {
  month: string; // YYYY-MM
  answer?: Answer;
  hasAnswer: boolean;
}

export function DayAnswerHistory({ day, month, onClose, onRefresh }: DayAnswerHistoryProps) {
  const [status, setStatus] = useState<ViewStatus>('loading');
  const [monthAnswers, setMonthAnswers] = useState<MonthAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const { theme } = useTheme();

  // day에 해당하는 질문 가져오기
  const question = MOCK_QUESTIONS.find(q => q.questionDay === day) || MOCK_QUESTIONS[0];

  useEffect(() => {
    loadDayAnswerHistory();
  }, [day]);

  const loadDayAnswerHistory = async () => {
    setStatus('loading');
    try {
      // Mock API: GET /api/questions/{qid}/answers/history (최근 12개월)
      await new Promise(resolve => setTimeout(resolve, 800));

      // 최근 12개월 생성
      const now = new Date();
      const months: MonthAnswer[] = [];

      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        // Mock: 랜덤으로 일부 월에 답변 생성
        const hasAnswer = Math.random() > 0.5;

        if (hasAnswer) {
          const answerText = getMockAnswer(day, monthStr);
          months.push({
            month: monthStr,
            hasAnswer: true,
            answer: {
              id: Math.floor(Math.random() * 10000),
              questionId: question.id,
              questionContent: question.content,
              questionDay: question.questionDay,
              answerText: answerText,
              answeredAt: new Date(monthStr + `-${String(day).padStart(2, '0')}T14:30:00+09:00`).toISOString(),
              answerMonth: monthStr + '-01',
            }
          });
        } else {
          months.push({
            month: monthStr,
            hasAnswer: false,
          });
        }
      }

      setMonthAnswers(months);
      setStatus(months.some(m => m.hasAnswer) ? 'success' : 'empty');
    } catch (error) {
      console.error('일별 답변 히스토리 로딩 실패:', error);
      setStatus('error');
      toast.error('지금은 처리할 수 없어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return `${year}년 ${parseInt(month)}월`;
  };

  const handleViewAnswer = (answer: Answer) => {
    setSelectedAnswer(answer);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedAnswer(null);
  };

  if (showDetail && selectedAnswer) {
    return (
      <AnswerDetail
        answer={selectedAnswer}
        onClose={handleCloseDetail}
        onRefresh={loadDayAnswerHistory}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20 bg-background">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2 mr-2 text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl text-foreground">
            {day}일 답변 히스토리
          </h1>
        </div>

        {/* Question Card */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge 
                className="text-white"
                style={{ backgroundColor: '#7B8B4F' }}
              >
                {day}일
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {question.content}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {status === 'loading' && (
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: '#7B8B4F' }} />
              <p className="text-sm text-muted-foreground">
                답변을 불러오는 중...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State - List */}
      {status === 'success' && (
        <div className="space-y-3">
          {monthAnswers.map(item => (
            <Card 
              key={item.month} 
              className="bg-card border-border"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Month Badge */}
                  <Badge 
                    className={item.hasAnswer ? 'text-white' : 'text-muted-foreground'}
                    style={{ 
                      backgroundColor: item.hasAnswer ? '#7B8B4F' : (theme === 'dark' ? '#3a3a3a' : '#E5E5E5'),
                      minWidth: '80px',
                      justifyContent: 'center'
                    }}
                  >
                    {formatMonthLabel(item.month)}
                  </Badge>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {item.hasAnswer && item.answer ? (
                      <p className="text-sm line-clamp-2 text-foreground">
                        {item.answer.answerText}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        답변 없음
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  {item.hasAnswer && item.answer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewAnswer(item.answer!)}
                      className="shrink-0"
                      style={{ color: '#7B8B4F' }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mt-2 ml-20 flex items-center gap-2">
                  {item.hasAnswer ? (
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ borderColor: '#7B8B4F', color: '#7B8B4F' }}
                    >
                      작성 완료
                    </Badge>
                  ) : (
                    <Badge 
                      variant="outline" 
                      className="text-xs border-border text-muted-foreground"
                    >
                      미작성
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {status === 'empty' && (
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 mb-4 text-muted-foreground" />
              <p className="text-sm mb-2 text-foreground">
                이 질문에 대한 답변이 없어요
              </p>
              <p className="text-xs text-muted-foreground">
                오늘의 질문에서 답변을 작성해보세요
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
              <AlertCircle className="w-12 h-12 mb-4" style={{ color: '#EF4444' }} />
              <p className="text-sm mb-2 text-foreground">
                답변을 불러올 수 없어요
              </p>
              <p className="text-xs mb-4 text-muted-foreground">
                지금은 처리할 수 없어요. 잠시 후 다시 시도해 주세요.
              </p>
              <Button
                onClick={loadDayAnswerHistory}
                variant="outline"
                size="sm"
                className="border-border text-foreground"
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