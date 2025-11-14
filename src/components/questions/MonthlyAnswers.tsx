import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Eye, Edit, ArrowLeft, History } from 'lucide-react';
import { toast } from 'sonner';
import { Answer } from './types';
import { MOCK_QUESTIONS, getMockAnswer, saveMockAnswer } from './mockData';
import { AnswerDetail } from './AnswerDetail';
import { DayAnswerHistory } from './DayAnswerHistory';

type ViewStatus = 'loading' | 'success' | 'empty' | 'error';

interface MonthlyAnswerItem {
  questionDay: number;
  questionContent: string;
  answer?: Answer;
  hasAnswer: boolean;
}

interface MonthlyAnswersProps {
  onBack?: () => void;
}

export function MonthlyAnswers({ onBack }: MonthlyAnswersProps = {}) {
  const [status, setStatus] = useState<ViewStatus>('loading');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [monthlyItems, setMonthlyItems] = useState<MonthlyAnswerItem[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayHistory, setShowDayHistory] = useState(false);

  // 월 선택 옵션 생성 (최근 12개월)
  const generateMonthOptions = () => {
    const options: string[] = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      options.push(monthStr);
    }
    
    return options;
  };

  const monthOptions = generateMonthOptions();

  useEffect(() => {
    // 기본값: 현재 월
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      loadMonthlyAnswers();
    }
  }, [selectedMonth]);

  const loadMonthlyAnswers = async () => {
    setStatus('loading');
    try {
      // Mock API: GET /api/questions/answers/me?month=yyyy-MM
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock: 랜덤으로 일부 날짜에 답변 생성
      const mockAnswers: Answer[] = [];
      const randomDays = [3, 7, 10, 15, 20, 25];
      
      randomDays.forEach(day => {
        const question = MOCK_QUESTIONS.find(q => q.questionDay === day);
        if (question) {
          const answerText = getMockAnswer(day, selectedMonth);
          mockAnswers.push({
            id: Math.floor(Math.random() * 10000),
            questionId: question.id,
            questionContent: question.content,
            questionDay: question.questionDay,
            answerText: answerText,
            answeredAt: new Date(selectedMonth + `-${String(day).padStart(2, '0')}T14:30:00+09:00`).toISOString(),
            answerMonth: selectedMonth + '-01',
          });
        }
      });

      // 1~31일 모든 아이템 생성
      const items: MonthlyAnswerItem[] = MOCK_QUESTIONS.map(question => {
        const answer = mockAnswers.find(a => a.questionDay === question.questionDay);
        return {
          questionDay: question.questionDay,
          questionContent: question.content,
          answer,
          hasAnswer: !!answer,
        };
      });

      setMonthlyItems(items);
      setStatus(mockAnswers.length > 0 ? 'success' : 'empty');
    } catch (error) {
      console.error('월별 답변 로딩 실패:', error);
      setStatus('error');
      toast.error('지금은 처리할 수 없어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const handlePrevMonth = () => {
    const currentIndex = monthOptions.indexOf(selectedMonth);
    if (currentIndex < monthOptions.length - 1) {
      setSelectedMonth(monthOptions[currentIndex + 1]);
    }
  };

  const handleNextMonth = () => {
    const currentIndex = monthOptions.indexOf(selectedMonth);
    if (currentIndex > 0) {
      setSelectedMonth(monthOptions[currentIndex - 1]);
    }
  };

  const handleViewAnswer = (answer: Answer) => {
    setSelectedAnswer(answer);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedAnswer(null);
  };

  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return `${year}년 ${parseInt(month)}월`;
  };

  const canGoPrev = monthOptions.indexOf(selectedMonth) < monthOptions.length - 1;
  const canGoNext = monthOptions.indexOf(selectedMonth) > 0;

  if (showDetail && selectedAnswer) {
    return (
      <AnswerDetail
        answer={selectedAnswer}
        onClose={handleCloseDetail}
        onRefresh={loadMonthlyAnswers}
      />
    );
  }

  if (showDayHistory && selectedDay !== null) {
    return (
      <DayAnswerHistory
        day={selectedDay}
        month={selectedMonth}
        onClose={() => setShowDayHistory(false)}
        onRefresh={loadMonthlyAnswers}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20 bg-background">
      {/* Header */}
      <div className="mb-6">
        {/* Back Button and Title */}
        <div className="flex items-center mb-4">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="p-2 mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-2xl text-foreground">
            월별 답변
          </h1>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            disabled={!canGoPrev || status === 'loading'}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="flex-1 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(month => (
                <SelectItem key={month} value={month}>
                  {formatMonthLabel(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            disabled={!canGoNext || status === 'loading'}
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {status === 'loading' && (
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
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
          {monthlyItems.map(item => (
            <Card 
              key={item.questionDay} 
              className="bg-card border-border"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Day Badge */}
                  <Badge 
                    className={
                      item.hasAnswer 
                        ? 'bg-primary text-white' 
                        : 'bg-muted text-muted-foreground'
                    }
                  >
                    {item.questionDay}일
                  </Badge>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-1 line-clamp-2 text-foreground">
                      {item.questionContent}
                    </p>
                    {item.hasAnswer && item.answer ? (
                      <p className="text-xs line-clamp-1 text-muted-foreground">
                        {item.answer.answerText}
                      </p>
                    ) : (
                      <p className="text-xs text-muted">
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
                      className="shrink-0 text-primary"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mt-2 flex items-center gap-2">
                  {item.hasAnswer ? (
                    <Badge 
                      variant="outline" 
                      className="text-xs border-primary text-primary"
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
                  
                  {/* History Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDay(item.questionDay);
                      setShowDayHistory(true);
                    }}
                    className="text-xs h-auto py-1 px-2 text-accent"
                  >
                    <History className="w-3 h-3 mr-1" />
                    히스토리
                  </Button>
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
              <AlertCircle className="w-12 h-12 mb-4 text-muted" />
              <p className="text-sm mb-2 text-foreground">
                이 달에 작성한 답변이 없어요
              </p>
              <p className="text-xs text-muted-foreground">
                오늘의 질문 탭에서 답변을 작성해보세요
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
                답변을 불러올 수 없어요
              </p>
              <p className="text-xs mb-4 text-muted-foreground">
                지금은 처리할 수 없어요. 잠시 후 다시 시도해 주세요.
              </p>
              <Button
                onClick={loadMonthlyAnswers}
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