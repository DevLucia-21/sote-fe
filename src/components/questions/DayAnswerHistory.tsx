import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArrowLeft, Loader2, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { Answer } from './types';
import { AnswerDetail } from './AnswerDetail';

interface DayAnswerHistoryProps {
  day: number;
  month: string;          // YYYY-MM
  onClose: () => void;
  onRefresh?: () => void;
}

type ViewStatus = 'loading' | 'success' | 'empty' | 'error';

interface MonthAnswer {
  month: string;       // YYYY-MM
  hasAnswer: boolean;
  answer?: Answer | null;
}

/** UTC → KST */
const toKST = (dateStr: string) => {
  const d = new Date(dateStr);
  return new Date(d.getTime() + 9 * 60 * 60 * 1000);
};

/** KST 기준 day 추출 */
const getKSTDay = (dateStr: string) => {
  return toKST(dateStr).getDate();
};

export function DayAnswerHistory({ day, month, onClose }: DayAnswerHistoryProps) {
  const [status, setStatus] = useState<ViewStatus>('loading');
  const [questionContent, setQuestionContent] = useState<string>(''); // 🔥 기준 질문 본문
  const [monthAnswers, setMonthAnswers] = useState<MonthAnswer[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);

  useEffect(() => {
    loadHistory();
  }, [day, month]);

  const loadHistory = async () => {
    setStatus('loading');

    try {
      /** 1) 먼저 기준 달의 질문 리스트 조회 */
      const baseRes = await api.get("/api/questions/answers/me", {
        params: { month }
      });

      const baseList = baseRes.data ?? [];

      /** 2) 이 달 기준으로 questionDay === day 인 질문 찾기 */
      const baseMatch = baseList.find((item: any) => item.questionDay === day);

      console.group(`📌 기준 월(${month}) 질문 탐색`);
baseList.forEach((item: any) => {
  console.log({
    questionDay: item.questionDay,
    date: item.date,
    kstDay: item.date ? getKSTDay(item.date) : null,
    questionContent: item.questionContent,
    answerText: item.answerText
  });
});
console.groupEnd();

      if (!baseMatch) {
        setQuestionContent('');
        setStatus('empty');
        return;
      }

      // 기준 질문 본문 저장
      setQuestionContent(baseMatch.questionContent);

      /** 3) 최근 12개월 히스토리 조회 */
      const now = new Date();
      const results: MonthAnswer[] = [];

      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}`;

        const res = await api.get("/api/questions/answers/me", {
          params: { month: monthStr }
        });

        const monthlyList = res.data ?? [];

        console.group(`🔍 ${monthStr} 월 탐색`);
monthlyList.forEach((item: any) => {
  console.log({
    item
  });
});
console.groupEnd();

        /** 🔥 같은 day를 가진 질문 찾기 */
        const match = monthlyList.find(
          (item: any) =>
            item.questionDay === baseMatch.questionDay &&
            item.questionContent === baseMatch.questionContent
        );

        if (match) {
          const hasAnswer = match.answerId !== null && match.answerId !== undefined;

          results.push({
            month: monthStr,
            hasAnswer,
            answer: hasAnswer ? {
              answerId: match.answerId,
              answerText: match.answerText,
              answeredAt: match.answeredAt,
              questionId: match.questionId,
              questionDay: match.questionDay,
              questionContent: match.questionContent,
              date: match.date
            } : null
          });
        } else {
          results.push({
            month: monthStr,
            hasAnswer: false,
            answer: null
          });
        }
      }

      setMonthAnswers(results);

      if (results.some(r => r.hasAnswer)) setStatus('success');
      else setStatus('empty');

    } catch (err) {
      console.error("❌ 로딩 실패", err);
      toast.error("답변을 불러오지 못했어요.");
      setStatus('error');
    }
  };

  const formatMonthLabel = (monthStr: string) => {
    const [y, m] = monthStr.split("-");
    return `${y}년 ${parseInt(m)}월`;
  };

  if (showDetail && selectedAnswer) {
    return (
      <AnswerDetail
        answer={selectedAnswer}
        onClose={() => {
          setShowDetail(false);
          setSelectedAnswer(null);
        }}
        onRefresh={loadHistory}
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
          <h1 className="text-2xl text-foreground">{day}일 답변 히스토리</h1>
        </div>

        {/* Question Card */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <Badge className="text-white bg-primary mb-3">{day}일</Badge>
            <p className="text-sm text-foreground leading-relaxed">
              {questionContent || "해당 날짜의 질문을 찾을 수 없어요."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loading */}
      {status === "loading" && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" />
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          </CardContent>
        </Card>
      )}

      {/* Success */}
      {status === "success" && (
        <div className="space-y-3">
          {monthAnswers.map(item => (
            <Card key={item.month} className="bg-card border-border">
              <CardContent className="p-4 flex gap-3">
                <Badge
                  className="min-w-[80px] justify-center"
                  style={{
                    backgroundColor: item.hasAnswer ? "#7B8B4F" : "#E5E5E5",
                    color: item.hasAnswer ? "#FFF" : "#666"
                  }}
                >
                  {formatMonthLabel(item.month)}
                </Badge>

                <div className="flex-1 min-w-0">
                  {item.hasAnswer ? (
                    <p className="text-sm text-foreground line-clamp-2">
                      {item.answer?.answerText}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">답변 없음</p>
                  )}
                </div>

                {item.hasAnswer && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                    onClick={() => {
                      setSelectedAnswer(item.answer!);
                      setShowDetail(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {status === "empty" && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-foreground mb-1">이 질문에 대한 답변이 없어요</p>
            <p className="text-xs text-muted-foreground">오늘의 질문에서 답변을 작성해보세요</p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {status === "error" && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-10 h-10 mx-auto text-red-500 mb-4" />
            <p className="text-sm text-foreground mb-1">불러올 수 없어요</p>
            <p className="text-xs text-muted-foreground mb-4">잠시 후 다시 시도해주세요</p>
            <Button variant="outline" size="sm" onClick={loadHistory}>
              다시 시도
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}