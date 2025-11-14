import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { WatchStressCard } from './WatchStressCard';
import { 
  Activity, 
  Heart, 
  Footprints, 
  Moon, 
  Droplets, 
  Coffee,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface HealthStatsTabProps {
  isConnected?: boolean;
}

export function HealthStatsTab({ isConnected = true }: HealthStatsTabProps) {
  // Mock 건강 데이터
  const [healthData] = useState({
    hrv: {
      current: 60.6,
      high: 78.2,
      low: 42.1,
      stressLevel: 'low', // low, medium, high
      lastSync: '30분 전 자동 동기화',
      timeline: [52, 58, 61, 55, 60, 65, 58, 62, 60, 57, 61, 60, 59, 62, 61, 58, 63, 60, 59, 61, 60, 58, 62, 59, 61, 60, 58, 63, 61, 60],
    },
    heartRate: {
      current: 72,
      lastSync: '30분 전 자동 동기화',
      timeline: [68, 70, 72, 71, 73, 72, 70, 71, 72],
    },
    steps: {
      current: 4512,
      goal: 10000,
      lastSync: '1시간마다 자동 업데이트',
    },
    sleep: {
      hours: 6,
      minutes: 42,
      quality: 'good', // poor, fair, good, excellent
      lastSync: '매일 아침 자동 수집',
    },
    hydration: {
      current: 850,
      goal: 2000,
      lastSync: '하루 1회 동기화',
    },
    caffeine: {
      current: 120,
      limit: 400,
      lastSync: '하루 1회 동기화',
    },
  });

  const getStressEmoji = (level: string) => {
    switch (level) {
      case 'low': return '😊';
      case 'medium': return '😐';
      case 'high': return '😣';
      default: return '😐';
    }
  };

  const getStressLabel = (level: string) => {
    switch (level) {
      case 'low': return '낮음';
      case 'medium': return '보통';
      case 'high': return '높음';
      default: return '보통';
    }
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case 'low': return '#7B8B4F';
      case 'medium': return '#E8A857';
      case 'high': return '#C44545';
      default: return '#E8A857';
    }
  };

  const getSleepQualityLabel = (quality: string) => {
    switch (quality) {
      case 'poor': return '부족';
      case 'fair': return '보통';
      case 'good': return '양호';
      case 'excellent': return '우수';
      default: return '보통';
    }
  };

  const getSleepQualityColor = (quality: string) => {
    switch (quality) {
      case 'poor': return '#C44545';
      case 'fair': return '#E8A857';
      case 'good': return '#7B8B4F';
      case 'excellent': return '#4A8B6F';
      default: return '#E8A857';
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <Card className="bg-white/70 backdrop-blur-sm border-border">
          <CardContent className="p-8 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4" style={{ color: '#7B8B4F', opacity: 0.4 }} />
            <h3 className="text-lg mb-2" style={{ color: '#4A3228' }}>건강 데이터 연동이 필요합니다</h3>
            <p className="text-sm text-muted-foreground mb-4">
              설정에서 건강 데이터를 연동하면<br />
              워치와 연동된 건강 통계를 확인할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 스트레스 (워치) - 7일 데이터 */}
      <WatchStressCard />

      {/* 심박수 */}
      <Card className="bg-white/70 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Heart className="w-10 h-10 mr-2" style={{ color: '#C44545' }} />
            심박수
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-2">
            <div className="text-4xl mb-2" style={{ color: '#4A3228' }}>
              {healthData.heartRate.current} <span className="text-xl text-muted-foreground">bpm</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-right">30분 전</p>
        </CardContent>
      </Card>

      {/* 걸음 수 */}
      <Card className="bg-white/70 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Footprints className="w-10 h-10 mr-2" style={{ color: '#7B8B4F' }} />
            걸음 수
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-2">
            <div className="text-4xl mb-2" style={{ color: '#4A3228' }}>
              {healthData.steps.current.toLocaleString()} <span className="text-xl text-muted-foreground">걸음</span>
            </div>
            <p className="text-sm text-muted-foreground">
              목표: {healthData.steps.goal.toLocaleString()} 걸음
            </p>
          </div>

          {/* 진행 바 */}
          <div className="space-y-2">
            <Progress 
              value={(healthData.steps.current / healthData.steps.goal) * 100} 
              className="h-3"
              style={{
                backgroundColor: '#E6E0D6',
              }}
            />
            <p className="text-xs text-muted-foreground text-center">
              {Math.round((healthData.steps.current / healthData.steps.goal) * 100)}% 달성
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-right">1시간 전</p>
        </CardContent>
      </Card>

      {/* 수면 */}
      <Card className="bg-white/70 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Moon className="w-10 h-10 mr-2" style={{ color: '#5B6B8F' }} />
            수면
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-2">
            <div className="text-4xl mb-2" style={{ color: '#4A3228' }}>
              {healthData.sleep.hours}시간 {healthData.sleep.minutes}분
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-right">오늘 오전 8시</p>
        </CardContent>
      </Card>

      {/* 수분 섭취 */}
      <Card className="bg-white/70 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Droplets className="w-10 h-10 mr-2" style={{ color: '#4A9EC4' }} />
            수분 섭취
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-2">
            <div className="text-4xl mb-2" style={{ color: '#4A3228' }}>
              {healthData.hydration.current} <span className="text-xl text-muted-foreground">mL</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-right">2시간 전</p>
        </CardContent>
      </Card>

      {/* 카페인 */}
      <Card className="bg-white/70 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Coffee className="w-10 h-10 mr-2" style={{ color: '#7B3E2E' }} />
            카페인
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-2">
            <div className="text-4xl mb-2" style={{ color: '#4A3228' }}>
              {healthData.caffeine.current} <span className="text-xl text-muted-foreground">mg</span>
            </div>
            <p className="text-sm text-muted-foreground">
              권장 한계: {healthData.caffeine.limit} mg
            </p>
          </div>

          {/* 진행 바 */}
          <div className="space-y-2">
            <Progress 
              value={(healthData.caffeine.current / healthData.caffeine.limit) * 100} 
              className="h-3"
              style={{
                backgroundColor: '#E6E0D6',
              }}
            />
            <p className="text-xs text-muted-foreground text-center">
              {Math.round((healthData.caffeine.current / healthData.caffeine.limit) * 100)}% (권장량 기준)
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-right">3시간 전</p>
        </CardContent>
      </Card>
    </div>
  );
}