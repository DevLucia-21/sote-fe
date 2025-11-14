import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { ArrowLeft, Activity, Heart, Footprints, Moon, Droplets, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface HealthDataViewProps {
  onBack: () => void;
}

export function HealthDataView({ onBack }: HealthDataViewProps) {
  const [permissions, setPermissions] = useState({
    steps: true,
    heartRate: false,
    sleep: true,
    water: false,
    caffeine: true,
  });

  // 워치 연동 시 자동으로 건강 데이터도 연동됨
  const [isConnected] = useState(true);

  // 이지모드 감지
  const [isEasyMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const theme = localStorage.getItem('theme');
    return theme === 'easy';
  });

  const healthDataTypes = [
    { key: 'steps', icon: Footprints, label: '걸음 수', description: '하루 걸음 수를 기록합니다', color: '#7B8B4F' },
    { key: 'heartRate', icon: Heart, label: '심박수', description: '심박수 데이터를 수집합니다', color: '#C44545' },
    { key: 'sleep', icon: Moon, label: '수면', description: '수면 패턴을 분석합니다', color: '#5B6B8F' },
    { key: 'water', icon: Droplets, label: '수분 섭취', description: '물 섭취량을 기록합니다', color: '#4A9EC4' },
    { key: 'caffeine', icon: Activity, label: '카페인', description: '카페인 섭취량을 기록합니다', color: '#7B3E2E' },
  ];

  const togglePermission = (key: string) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('권한이 업데이트되었습니다.');
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setPermissions({
      steps: false,
      heartRate: false,
      sleep: false,
      water: false,
      caffeine: false,
    });
    toast.success('건강 데이터 연동이 해제되었습니다.');
  };

  const handleConnect = () => {
    setIsConnected(true);
    toast.success('건강 데이터가 연동되었습니다.');
  };

  const enabledCount = Object.values(permissions).filter(Boolean).length;

  return (
    <div className="min-h-screen p-4 space-y-4 bg-background">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className={`-ml-2 gap-1 ${isEasyMode ? 'text-xl py-6' : ''}`}
        >
          <ArrowLeft className={isEasyMode ? 'w-6 h-6' : 'w-4 h-4'} />
          뒤로
        </Button>
      </div>

      {/* Connection Status Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`flex items-center ${isEasyMode ? 'text-xl' : ''}`}>
                <Activity className={`${isEasyMode ? 'w-8 h-8' : 'w-5 h-5'} mr-2`} style={{ color: '#7B8B4F' }} />
                건강 데이터 연동
              </CardTitle>
              {!isEasyMode && (
                <CardDescription className="mt-2">
                  감정 패턴과 건강 데이터를 함께 분석하세요
                </CardDescription>
              )}
            </div>
            <Badge 
              variant={isConnected ? 'default' : 'outline'} 
              className={isEasyMode ? 'text-sm px-3 py-1' : ''}
              style={{
                backgroundColor: isConnected ? '#7B8B4F' : 'transparent',
                borderColor: isConnected ? '#7B8B4F' : '#E6E0D6',
                color: isConnected ? 'white' : '#666'
              }}
            >
              {isConnected ? '연동됨' : '미연동'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`bg-[#F5F1E8] ${isEasyMode ? 'p-6' : 'p-4'} rounded-lg border`} style={{ borderColor: '#E6E0D6' }}>
            <div className="flex items-start gap-3">
              {isConnected ? (
                <Check className={`${isEasyMode ? 'w-7 h-7' : 'w-5 h-5'} mt-0.5`} style={{ color: '#7B8B4F' }} />
              ) : (
                <AlertCircle className={`${isEasyMode ? 'w-7 h-7' : 'w-5 h-5'} mt-0.5`} style={{ color: '#7B3E2E' }} />
              )}
              <div className="flex-1">
                {isEasyMode ? (
                  <div>
                    <p className="text-lg" style={{ color: '#4A3228' }}>
                      {isConnected ? (
                        <>
                          건강 데이터가<br />
                          연동되었습니다
                        </>
                      ) : (
                        '건강 데이터 연동이 필요합니다'
                      )}
                    </p>
                    {isConnected && (
                      <div className="flex justify-end mt-1">
                        <p className="text-base font-bold" style={{ color: '#4A3228' }}>
                          {enabledCount}개
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-sm" style={{ color: '#4A3228' }}>
                      {isConnected ? '건강 데이터가 연동되었습니다' : '건강 데이터 연동이 필요합니다'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {isConnected 
                        ? `현재 ${enabledCount}개의 데이터 타입에 대한 권한이 활성화되어 있습니다.`
                        : 'Apple Health 또는 Google Fit과 연동하여 더 정확한 감정 분석을 받아보세요.'
                      }
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {!isConnected && (
            <Button
              onClick={handleConnect}
              className={`w-full text-white ${isEasyMode ? 'text-2xl py-8' : ''}`}
              style={{ backgroundColor: '#7B8B4F' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6E7C46'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7B8B4F'}
            >
              건강 데이터 연동하기
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Permissions Card */}
      {isConnected && (
        <>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className={isEasyMode ? 'text-2xl' : 'text-base'}>권한 관리</CardTitle>
              <CardDescription className={isEasyMode ? 'text-lg' : ''}>수집할 건강 데이터 유형을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthDataTypes.map((item, index) => {
                const Icon = item.icon;
                const isEnabled = permissions[item.key as keyof typeof permissions];
                
                return (
                  <div key={item.key}>
                    {index > 0 && <Separator style={{ backgroundColor: '#E6E0D6' }} className="my-4" />}
                    <div className={`flex items-center justify-between ${isEasyMode ? 'py-2' : ''}`}>
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className={`${isEasyMode ? 'w-7 h-7' : 'w-5 h-5'} mt-0.5`} style={{ color: item.color }} />
                        <div className="flex-1">
                          <p className={isEasyMode ? 'text-xl' : 'text-sm'} style={{ color: '#4A3228' }}>{item.label}</p>
                          {!isEasyMode && (
                            <p className="text-xs text-gray-500">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => togglePermission(item.key)}
                        className={isEasyMode ? 'scale-150' : ''}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}

      {/* Info Card - 제거 */}
      {/* Disconnect Button - 제거 */}
    </div>
  );
}