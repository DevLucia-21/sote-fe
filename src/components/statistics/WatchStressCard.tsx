/**
 * WatchStressCard Component
 * 
 * 통계 뷰의 누적 탭에서 워치(Health Connect) 연동 시 
 * 스트레스 데이터(HRV)를 시각화하여 보여주는 카드 컴포넌트
 * 
 * Features:
 * - 오늘 스트레스 레벨 배지 표시 (LOW/MEDIUM/HIGH)
 * - 7일/30일 기간 선택
 * - 평균 HRV 및 추세 스파크라인 차트
 * - 최고/최저 HRV 정보
 * - 워치 미연동 시 Empty 상태 표시
 * 
 * API Endpoints:
 * - GET /api/watch/stress/today - 오늘 스트레스 요약
 * - GET /api/watch/stress/stats?from=YYYY-MM-DD&to=YYYY-MM-DD - 기간별 통계
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Activity, Watch, AlertCircle } from 'lucide-react';

// ========== Types ==========

interface StressTodayResponse {
  averageHrv: number;
  stressLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  date: string;
}

interface StressStatsItem {
  date: string;
  averageHrv: number;
  stressLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

type Period = '7' | '30';

// ========== Constants ==========

const STRESS_LEVEL_CONFIG = {
  LOW: { 
    label: 'LOW', 
    variant: 'default' as const,
    color: '#7B8B4F',
    bgColor: '#7B8B4F'
  },
  MEDIUM: { 
    label: 'MEDIUM', 
    variant: 'secondary' as const,
    color: '#F59E0B',
    bgColor: '#F59E0B'
  },
  HIGH: { 
    label: 'HIGH', 
    variant: 'destructive' as const,
    color: '#EF4444',
    bgColor: '#EF4444'
  }
};

// HRV 레벨 판단 함수
const getStressLevelFromHrv = (hrv: number): 'LOW' | 'MEDIUM' | 'HIGH' => {
  if (hrv >= 60) return 'LOW';
  if (hrv >= 40) return 'MEDIUM';
  return 'HIGH';
};

// ========== Component ==========

export function WatchStressCard() {
  const [period, setPeriod] = useState<Period>('7');
  // Set to null initially for loading state, true for connected, false for not connected
  // To test empty state: change initial value to false
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [todayData, setTodayData] = useState<StressTodayResponse | null>(null);
  const [statsData, setStatsData] = useState<StressStatsItem[]>([]);

  // ========== Fetch Data ==========

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const todayResponse = await fetch('/api/watch/stress/today');
        if (!todayResponse.ok) {
          if (todayResponse.status === 401 || todayResponse.status === 404) {
            setIsConnected(false);
            return;
          }
          throw new Error('Failed to fetch today data');
        }
        const todayJson = await todayResponse.json();
        
        setTodayData(todayJson);
        setIsConnected(true);

        // 통계 데이터 가져오기 (항상 7일)
        const daysToFetch = 7;
        const today = new Date();
        const fromDate = new Date(today);
        fromDate.setDate(today.getDate() - (daysToFetch - 1));

        const fromStr = fromDate.toISOString().split('T')[0];
        const toStr = today.toISOString().split('T')[0];

        const statsResponse = await fetch(`/api/watch/stress/stats?from=${fromStr}&to=${toStr}`);
        if (!statsResponse.ok) throw new Error('Failed to fetch stats');
        const statsJson = await statsResponse.json();

        setStatsData(statsJson);

      } catch (err) {
        console.error('Error fetching watch stress data:', err);
        setError('스트레스 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected !== false) {
      fetchData();
    }
  }, [isConnected]); // period 제거

  // ========== Calculations ==========

  const avgHrv = statsData.length > 0
    ? statsData.reduce((sum, item) => sum + item.averageHrv, 0) / statsData.length
    : 0;

  const maxHrvItem = statsData.length > 0
    ? statsData.reduce((max, item) => item.averageHrv > max.averageHrv ? item : max)
    : null;

  const minHrvItem = statsData.length > 0
    ? statsData.reduce((min, item) => item.averageHrv < min.averageHrv ? item : min)
    : null;

  // ========== Render: Empty State (Not Connected) ==========

  if (isConnected === false) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-10 h-10 mr-2" style={{ color: '#7B8B4F' }} />
            스트레스
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Watch className="w-12 h-12" style={{ color: '#4A3228', opacity: 0.3 }} />
            <p className="text-sm text-center" style={{ color: '#4A3228', opacity: 0.7 }}>
              워치 연동이 필요합니다
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                // TODO: Navigate to settings/devices when route is available
                console.log('Navigate to settings/devices');
              }}
              style={{ borderColor: '#7B8B4F', color: '#7B8B4F' }}
            >
              연동하기
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ========== Render: Loading State ==========

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-10 h-10 mr-2" style={{ color: '#7B8B4F' }} />
            스트레스
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-6 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ========== Render: Main Content ==========

  const currentStressLevel = todayData?.stressLevel || 'LOW';
  const stressConfig = STRESS_LEVEL_CONFIG[currentStressLevel];

  return (
    <Card className="bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <Activity className="w-10 h-10 mr-2" style={{ color: '#7B8B4F' }} />
              스트레스
            </CardTitle>
          </div>
          <Badge 
            variant={stressConfig.variant}
            style={{
              backgroundColor: `${stressConfig.bgColor}15`,
              color: stressConfig.color,
              borderColor: stressConfig.color
            }}
            aria-label={`오늘 스트레스 레벨 ${stressConfig.label}`}
          >
            {stressConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Message */}
        {error && (
          <div 
            className="flex items-center gap-2 p-3 rounded-lg text-sm"
            style={{ backgroundColor: '#FEF2F2', color: '#991B1B' }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Average HRV */}
        <div>
          <p className="text-sm mb-1" style={{ color: '#4A3228', opacity: 0.7 }}>
            평균 HRV
          </p>
          <div className="flex items-baseline gap-2" aria-label={`평균 HRV ${avgHrv.toFixed(1)} 밀리초`}>
            <span className="text-3xl" style={{ color: '#7B8B4F' }}>
              {avgHrv.toFixed(1)}
            </span>
            <span className="text-sm" style={{ color: '#4A3228', opacity: 0.7 }}>
              ms
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: '#4A3228', opacity: 0.5 }}>
            최근 7일
          </p>
        </div>

        {/* Sparkline Chart - 귀엽게 수정 */}
        <div className="relative h-32 bg-gradient-to-b from-[#7B8B4F]/5 to-transparent rounded-lg p-4">
          <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7B8B4F" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#7B8B4F" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7B8B4F" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#7B8B4F" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            
            {/* Generate path for sparkline */}
            {statsData.length > 0 && (() => {
              const minHrv = Math.min(...statsData.map(d => d.averageHrv));
              const maxHrv = Math.max(...statsData.map(d => d.averageHrv));
              // 최소 범위를 20으로 설정하여 변화를 더 명확하게 표시
              const range = Math.max(maxHrv - minHrv, 20);
              const baseMin = minHrv - (range - (maxHrv - minHrv)) / 2;
              
              // SVG 좌표 계산 (패딩 추가)
              const padding = 10;
              const chartWidth = 400 - padding * 2;
              const chartHeight = 100 - padding * 2;
              
              const points = statsData.map((item, index) => {
                const x = padding + (statsData.length > 1 ? (index / (statsData.length - 1)) * chartWidth : chartWidth / 2);
                const normalizedValue = (item.averageHrv - baseMin) / range;
                const y = padding + chartHeight - (normalizedValue * chartHeight);
                return { x, y, item };
              });

              // 라인용 포인트 문자열
              const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
              
              // 영역(area) 채우기용 경로
              const areaPath = `
                M ${points[0].x},${100 - padding}
                L ${points.map(p => `${p.x},${p.y}`).join(' L ')}
                L ${points[points.length - 1].x},${100 - padding}
                Z
              `;

              return (
                <>
                  {/* 영역 채우기 */}
                  <path
                    d={areaPath}
                    fill="url(#areaGradient)"
                  />
                  
                  {/* 라인 - 더 귀엽게 */}
                  <polyline
                    points={linePoints}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* 데이터 포인트 - 더 작고 귀엽게 */}
                  {points.map((point, index) => (
                    <g key={index}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="3"
                        fill="#7B8B4F"
                        stroke="white"
                        strokeWidth="2"
                        style={{ cursor: 'pointer' }}
                      >
                        <title>{`${new Date(point.item.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} · ${point.item.averageHrv.toFixed(1)} ms · ${point.item.stressLevel}`}</title>
                      </circle>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
          
          {/* Y축 레이블 (옵션) */}
          {statsData.length > 0 && (
            <>
              <div className="absolute top-2 right-2 text-xs" style={{ color: '#4A3228', opacity: 0.4 }}>
                {Math.max(...statsData.map(d => d.averageHrv)).toFixed(0)}
              </div>
              <div className="absolute bottom-2 right-2 text-xs" style={{ color: '#4A3228', opacity: 0.4 }}>
                {Math.min(...statsData.map(d => d.averageHrv)).toFixed(0)}
              </div>
            </>
          )}
        </div>

        {/* Stress Level Legend */}
        <div className="space-y-2">
          <p className="text-xs" style={{ color: '#4A3228', opacity: 0.6 }}>
            스트레스 레벨
          </p>
          <div className="relative">
            <div className="h-3 rounded-full overflow-hidden flex">
              <div className="flex-1" style={{ backgroundColor: STRESS_LEVEL_CONFIG.LOW.bgColor, opacity: 0.3 }} />
              <div className="flex-1" style={{ backgroundColor: STRESS_LEVEL_CONFIG.MEDIUM.bgColor, opacity: 0.3 }} />
              <div className="flex-1" style={{ backgroundColor: STRESS_LEVEL_CONFIG.HIGH.bgColor, opacity: 0.3 }} />
            </div>
            {/* Current position indicator */}
            <div 
              className="absolute w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: stressConfig.bgColor,
                left: currentStressLevel === 'LOW' ? '16.67%' : 
                      currentStressLevel === 'MEDIUM' ? '50%' : '83.33%',
                transform: 'translate(-50%, -50%)',
                top: '50%'
              }}
            />
          </div>
          <div className="flex justify-between text-xs mt-3" style={{ color: '#4A3228', opacity: 0.6 }}>
            <span>LOW</span>
            <span>MEDIUM</span>
            <span>HIGH</span>
          </div>
        </div>

        {/* Min/Max HRV */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#7B8B4F]/5 to-[#7B8B4F]/10 rounded-lg p-3 border" style={{ borderColor: '#E5E5E5' }}>
            <p className="text-xs mb-1" style={{ color: '#4A3228', opacity: 0.6 }}>
              최고 HRV
            </p>
            {maxHrvItem && (
              <>
                <p className="text-xl" style={{ color: '#7B8B4F' }}>
                  {maxHrvItem.averageHrv.toFixed(1)}
                  <span className="text-xs ml-1">ms</span>
                </p>
                <p className="text-xs mt-1" style={{ color: '#4A3228', opacity: 0.5 }}>
                  {new Date(maxHrvItem.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </p>
              </>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border" style={{ borderColor: '#E5E5E5' }}>
            <p className="text-xs mb-1" style={{ color: '#4A3228', opacity: 0.6 }}>
              최저 HRV
            </p>
            {minHrvItem && (
              <>
                <p className="text-xl" style={{ color: '#4A3228', opacity: 0.8 }}>
                  {minHrvItem.averageHrv.toFixed(1)}
                  <span className="text-xs ml-1">ms</span>
                </p>
                <p className="text-xs mt-1" style={{ color: '#4A3228', opacity: 0.5 }}>
                  {new Date(minHrvItem.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}