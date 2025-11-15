import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import { EmotionChip } from './EmotionChip';
import { Progress } from '../ui/progress';

interface ChallengeDetail {
  id: number;
  date: string;
  emotionType: 'JOY' | 'SADNESS' | 'ANGER' | 'APATHY' | 'SENSITIVE';
  emotionLabel: string;
  category: string;
  content: string;
  completed: boolean;
  completedAt?: string;
}

interface ChallengeDayDetailProps {
  challengeId: number;
  onBack: () => void;
}

export function ChallengeDayDetail({ challengeId, onBack }: ChallengeDayDetailProps) {
  const [detail, setDetail] = useState<ChallengeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("받은 id:", challengeId);
    
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/api/challenge/history/${challengeId}`);
        setDetail(res.data);
      } catch (err) {
        console.error("❌ 상세 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [challengeId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${dayName})`;
  };

  if (loading || !detail) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-background">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로
        </Button>
        <h2 className="text-foreground">챌린지 상세</h2>
        <div></div>
      </div>

      {/* 날짜 정보 */}
      <Card className="bg-card/70 backdrop-blur-sm mb-4 border-border">
        <CardContent className="p-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground">
            {formatDate(detail.date)}
          </span>
        </CardContent>
      </Card>

      {/* 챌린지 내용 */}
      <Card className="bg-card/70 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            이 날의 챌린지
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-5 rounded-xl text-center space-y-4 bg-card border border-border">
            
            {/* 감정 / 카테고리 */}
            <div className="flex items-center justify-center gap-2">
              <EmotionChip emotion={detail.emotionType} />
              <span className="px-3 py-1 rounded-full text-sm bg-accent text-white">
                {detail.category}
              </span>
            </div>

            {/* 내용 */}
            <p className="leading-relaxed text-foreground text-lg">
              {detail.content}
            </p>

            <div className="w-full h-px bg-border" />

            {/* 완료 여부 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  완료 여부
                </span>

                {detail.completed ? (
                  <span className="px-3 py-1 rounded-full text-sm bg-primary text-white">
                    완료됨
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm bg-muted text-foreground">
                    미완료
                  </span>
                )}
              </div>

              {/* 진행 표시 (completed이면 100%) */}
              <Progress value={detail.completed ? 100 : 0} className="h-2" />
            </div>
          </div>

          {/* 완료 메시지 */}
          <div className="text-center">
            {detail.completed ? (
              <div className="px-4 py-3 rounded-lg bg-primary text-white">
                <p className="text-sm">✨ 이 날의 챌린지를 완료했어요!</p>
              </div>
            ) : (
              <div className="px-4 py-3 rounded-lg bg-muted text-muted-foreground">
                <p className="text-sm">이 날의 챌린지는 미완료 상태예요.</p>
              </div>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground opacity-70">
            과거 챌린지는 수정할 수 없어요
          </p>
        </CardContent>
      </Card>
    </div>
  );
}