/**
 * WatchPairingView Component
 * 
 * S:ote 워치 연동 및 페어링 화면
 * Settings > 워치 연동하기
 * 
 * Features:
 * - 6자리 페어링 코드 생성 및 표시 (워치에서 이 코드를 입력)
 * - 연결 성공 화면
 * - 워치 상태 관리 및 연결 해제
 */

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { 
  ArrowLeft, 
  Watch, 
  CheckCircle2, 
  Activity,
  RefreshCw,
  Copy,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { watchAuthAPI } from '../../services/api';
import type { WatchPairCodeResponse } from '../../types/api';
import { AuthStorage } from '../../utils/auth';

type ViewState = 
  | 'code-display'   // 6자리 코드 표시
  | 'success'        // 연결 성공
  | 'status';        // 워치 상태 관리

interface WatchPairingViewProps {
  onBack: () => void;
}

// Backend DTO Types (Guidelines.md - 백엔드 DTO와 1:1 매핑)
interface WatchStatusResponse {
  connected: boolean;
  deviceName?: string;
  lastSync?: string;
}

export function WatchPairingView({ onBack }: WatchPairingViewProps) {
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    // localStorage에서 워치 연결 상태 확인
    const connected = localStorage.getItem('watchConnected') === 'true';
    return connected ? 'status' : 'code-display';
  });
  
  const [pairCode, setPairCode] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(300); // 5분 = 300초
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [isWaitingForPair, setIsWaitingForPair] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [codeError, setCodeError] = useState<string>('');
  const [watchData, setWatchData] = useState({
  status: '연결됨',
    lastSync: localStorage.getItem('watchLastSync') || '-',
    model: localStorage.getItem('watchModel') || '-',
  });
  
  // 이지모드 감지
  const [isEasyMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const theme = localStorage.getItem('theme');
    return theme === 'easy';
  });

  const disconnectWatch = async () => {
    try {
      await api.post("/api/watch/auth/logout");

      localStorage.setItem("watchConnected", "false");
      localStorage.setItem("healthDataConnected", "false");

      window.dispatchEvent(new Event("watchConnectionChanged"));
      toast.success("워치 연동 해제됨");
    } catch (err) {
      toast.error("연동 해제 실패");
    }
  };

  // 페어링 코드 발급 API 호출
  const fetchPairCode = async () => {
    // 로그인 여부 확인
    const token = AuthStorage.getAccessToken();
    if (!token) {
      setCodeError('로그인이 필요합니다. 먼저 로그인해주세요.');
      toast.error('로그인이 필요합니다.');
      return;
    }

    setIsLoadingCode(true);
    setCodeError('');
    
    try {
      const response = await api.post("/api/watch/auth/pair-code");
      
      setPairCode(response.data.code); // pairCode → code
      setExpiresAt(response.data.expiresAt);
      
      // 만료 시간까지 남은 초 계산
      const expiryTime = new Date(response.data.expiresAt).getTime();
      const now = Date.now();
      const remainingSeconds = Math.floor((expiryTime - now) / 1000);
      setCountdown(remainingSeconds > 0 ? remainingSeconds : 300);
      
    } catch (error: any) {
      console.error('Error fetching pair code:', error);
      
      // 에러 타입별 메시지
      let errorMessage = '코드 발급에 실패했습니다.';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = '서버에 연결할 수 없습니다. 백엔드 서버(localhost:8080)가 실행 중인지 확인해주세요.';
      } else if (error.response?.status === 401) {
        errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
        AuthStorage.clearTokens();
      } else if (error.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message) {
        errorMessage = `오류: ${error.message}`;
      }
      
      setCodeError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingCode(false);
    }
  };

  // 컴포넌트 마운트 시 코드 발급
  useEffect(() => {
    if (currentView === 'code-display' && !pairCode) {
      fetchPairCode();
    }
  }, [currentView]);

  // 카운트다운 타이머
  useEffect(() => {
    if (currentView === 'code-display' && countdown > 0 && pairCode) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // 시간 만료 시 새 코드 발급
            fetchPairCode();
            return 300;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentView, countdown, pairCode]);

  // 페어링 상태 폴링 (워치가 페어링했는지 확인)
  useEffect(() => {
    if (isWaitingForPair) {
      const pollInterval = setInterval(async () => {
        try {
          // 실제로는 백엔드에 워치 페어링 상태를 확인하는 API가 필요
          // 현재는 Mock으로 10초 후 자동 연결
          // TODO: 실제 API 구현 후 수정 필요
        } catch (error) {
          console.error('Error checking pair status:', error);
        }
      }, 2000); // 2초마다 확인

      // 페어링 상태 폴링
      useEffect(() => {
        if (!isWaitingForPair || !pairCode) return;

        const interval = setInterval(async () => {
          try {
            const res = await api.post("/api/watch/auth/pair");

            if (res.data.paired) {
              // 백엔드에서 받은 정보로 업데이트
              localStorage.setItem("watchConnected", "true");
              localStorage.setItem("watchModel", res.data.model);
              localStorage.setItem("watchLastSync", res.data.lastSync);

              setWatchData({
                status: "연결됨",
                model: res.data.model,
                lastSync: res.data.lastSync,
              });

              toast.success("워치가 성공적으로 연동되었습니다!");

              setIsWaitingForPair(false);
              setCurrentView("success");

              clearInterval(interval);
            }

          } catch (err) {
            console.error("Pair polling error:", err);
          }
        }, 2000); // 2초마다 재확인

        return () => clearInterval(interval);
      }, [isWaitingForPair, pairCode]);

      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [isWaitingForPair, pairCode]);

  // 포맷된 시간 (MM:SS)
  const formattedTime = `${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`;

  // 코드 복사
  const handleCopyCode = () => {
    if (!pairCode) return;
    navigator.clipboard.writeText(pairCode);
    toast.success('코드가 복사되었습니다');
  };

  // 코드 재생성
  const handleRegenerateCode = () => {
    fetchPairCode();
    toast('새로운 코드를 발급하고 있습니다...');
  };

  // 연결 대기 시작
  const handleStartWaiting = () => {
    if (!pairCode) {
      toast.error('코드를 먼저 발급받아주세요.');
      return;
    }
    setIsWaitingForPair(true);
    toast('워치에서 코드를 입력해주세요...');
  };

  // 연결 해제
  const handleDisconnect = async () => {
    await disconnectWatch();

    localStorage.removeItem('watchConnected');
    localStorage.removeItem('watchModel');
    localStorage.removeItem('watchLastSync');
    localStorage.removeItem('watchPairCode');

    setShowDisconnectDialog(false);
    setCurrentView('code-display');
    toast.success('워치 연결이 해제되었습니다.');
  };

  // ========== 6자리 코드 표시 화면 ==========
  if (currentView === 'code-display') {
    return (
      <div className="min-h-screen p-4 space-y-6" style={{ backgroundColor: '#F5F1E8' }}>
        {/* Header */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className={`-ml-2 gap-1 ${isEasyMode ? 'text-xl py-6' : ''}`}
            style={{ color: '#4A3228' }}
          >
            <ArrowLeft className={isEasyMode ? 'w-6 h-6' : 'w-4 h-4'} />
            뒤로
          </Button>
        </div>

        {/* Main Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div 
                className={`${isEasyMode ? 'w-24 h-24' : 'w-16 h-16'} rounded-full flex items-center justify-center`}
                style={{ backgroundColor: '#7B8B4F15' }}
              >
                <Watch className={isEasyMode ? 'w-14 h-14' : 'w-8 h-8'} style={{ color: '#7B8B4F' }} />
              </div>
            </div>
            <CardTitle className={isEasyMode ? 'text-3xl' : ''} style={{ color: '#4A3228' }}>워치 연동하기</CardTitle>
            <CardDescription className={isEasyMode ? 'text-xl' : ''} style={{ color: '#4A3228', opacity: 0.6 }}>
              워치에서 다음 코드를 입력하세요
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Loading State */}
            {isLoadingCode ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-3">
                  <RefreshCw className={`${isEasyMode ? 'w-12 h-12' : 'w-8 h-8'} animate-spin`} style={{ color: '#7B8B4F' }} />
                </div>
                <p className={isEasyMode ? 'text-xl' : 'text-sm'} style={{ color: '#4A3228', opacity: 0.6 }}>
                  코드를 발급하고 있습니다...
                </p>
              </div>
            ) : codeError ? (
              /* Error State */
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center">
                  <AlertCircle className={isEasyMode ? 'w-16 h-16' : 'w-12 h-12'} style={{ color: '#C44545' }} />
                </div>
                <div>
                  <p className={`${isEasyMode ? 'text-lg' : 'text-sm'} mb-2`} style={{ color: '#4A3228' }}>
                    {codeError}
                  </p>
                  <Button
                    onClick={fetchPairCode}
                    variant="outline"
                    size={isEasyMode ? 'default' : 'sm'}
                    className={`gap-1 ${isEasyMode ? 'text-xl py-6' : ''}`}
                    style={{ borderColor: '#E6E0D6', color: '#4A3228' }}
                  >
                    <RefreshCw className={isEasyMode ? 'w-5 h-5' : 'w-3 h-3'} />
                    다시 시도
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* 6-digit Code Display */}
                <div className="text-center space-y-4">
                  <div className="flex justify-center gap-2">
                    {pairCode.split('').map((digit, index) => (
                      <div
                        key={index}
                        className={`${isEasyMode ? 'w-16 h-20 text-4xl' : 'w-12 h-14 text-2xl'} flex items-center justify-center rounded-lg font-medium`}
                        style={{
                          backgroundColor: '#F5F1E8',
                          border: '2px solid #E6E0D6',
                          color: '#4A3228'
                        }}
                      >
                        {digit}
                      </div>
                    ))}
                  </div>

                  {/* Copy & Regenerate Buttons */}
                  <div className="flex gap-2 justify-center">
                    <Button
                      size={isEasyMode ? 'default' : 'sm'}
                      variant="outline"
                      onClick={handleCopyCode}
                      className={`gap-1 ${isEasyMode ? 'text-xl py-6' : ''}`}
                      style={{ borderColor: '#E6E0D6', color: '#4A3228' }}
                    >
                      <Copy className={isEasyMode ? 'w-5 h-5' : 'w-3 h-3'} />
                      복사
                    </Button>
                    <Button
                      size={isEasyMode ? 'default' : 'sm'}
                      variant="outline"
                      onClick={handleRegenerateCode}
                      className={`gap-1 ${isEasyMode ? 'text-xl py-6' : ''}`}
                      disabled={isLoadingCode}
                      style={{ borderColor: '#E6E0D6', color: '#4A3228' }}
                    >
                      <RefreshCw className={isEasyMode ? 'w-5 h-5' : 'w-3 h-3'} />
                      새 코드
                    </Button>
                  </div>
                </div>

                {/* Timer */}
                <div 
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg ${isEasyMode ? 'text-xl' : 'text-sm'}`}
                  style={{ backgroundColor: '#F5F1E8', color: '#4A3228' }}
                >
                  <span>유효 시간: {formattedTime}</span>
                </div>

                {/* Instructions */}
                <div 
                  className="p-4 rounded-lg space-y-2"
                  style={{ backgroundColor: '#F5F1E8', borderLeft: '4px solid #7B8B4F' }}
                >
                  <h4 className={isEasyMode ? 'text-xl' : 'text-sm'} style={{ color: '#4A3228' }}>📱 연결 방법</h4>
                  <ol className={`${isEasyMode ? 'text-base' : 'text-xs'} space-y-1`} style={{ color: '#4A3228', opacity: 0.7 }}>
                    <li>1. 워치에서 S:ote 앱을 실행하세요</li>
                    <li>2. "페어링 코드 입력"을 선택하세요</li>
                    <li>3. 위의 6자리 코드를 입력하세요</li>
                    <li>4. 자동으로 연결이 완료됩니다</li>
                  </ol>
                </div>

                {/* Wait Button */}
                <Button
                  onClick={handleStartWaiting}
                  disabled={isWaitingForPair || !pairCode}
                  className={`w-full text-white ${isEasyMode ? 'text-2xl py-8' : ''}`}
                  style={{ 
                    backgroundColor: '#7B8B4F',
                    opacity: (isWaitingForPair || !pairCode) ? 0.7 : 1
                  }}
                >
                  {isWaitingForPair ? '워치 연결 대기 중...' : '연결 시작'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========== 연결 성공 화면 ==========
  if (currentView === 'success') {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={{ backgroundColor: '#F5F1E8' }}>
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm max-w-sm w-full">
          <CardContent className="text-center py-12 space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div 
                className={`${isEasyMode ? 'w-28 h-28' : 'w-20 h-20'} rounded-full flex items-center justify-center`}
                style={{ backgroundColor: '#7B8B4F15' }}
              >
                <CheckCircle2 className={isEasyMode ? 'w-16 h-16' : 'w-12 h-12'} style={{ color: '#7B8B4F' }} />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className={isEasyMode ? 'text-4xl' : 'text-2xl'} style={{ color: '#4A3228' }}>
                연결 완료!
              </h2>
              <p className={isEasyMode ? 'text-xl' : ''} style={{ color: '#4A3228', opacity: 0.6 }}>
                워치와 성공적으로 연결되었습니다.
              </p>
            </div>

            {/* Confirm Button */}
            <Button
              onClick={() => {
                setCurrentView('status');
              }}
              className={`w-full text-white ${isEasyMode ? 'text-2xl py-8' : ''}`}
              style={{ backgroundColor: '#7B8B4F' }}
            >
              확인
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========== 워치 상태 관리 화면 ==========
  if (currentView === 'status') {
    return (
      <div className="min-h-screen p-4 space-y-6" style={{ backgroundColor: '#F5F1E8' }}>
        {/* Header */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className={`-ml-2 gap-1 ${isEasyMode ? 'text-xl py-6' : ''}`}
            style={{ color: '#4A3228' }}
          >
            <ArrowLeft className={isEasyMode ? 'w-6 h-6' : 'w-4 h-4'} />
            뒤로
          </Button>
        </div>

        {/* Title */}
        <div>
          <h1 className={isEasyMode ? 'text-4xl' : 'text-2xl'} style={{ color: '#4A3228' }}>워치 연동 관리</h1>
        </div>

        {/* Connection Status Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader>
            <CardTitle className={`flex items-center ${isEasyMode ? 'text-2xl' : ''}`} style={{ color: '#4A3228' }}>
              <Activity className={`${isEasyMode ? 'w-8 h-8' : 'w-5 h-5'} mr-2`} style={{ color: '#7B8B4F' }} />
              연결 상태
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Info */}
            <div className="space-y-3">
              <div className={`flex justify-between items-center ${isEasyMode ? 'py-4' : 'py-2'}`}>
                <span className={isEasyMode ? 'text-xl' : 'text-sm'} style={{ color: '#4A3228', opacity: 0.7 }}>
                  연결 상태
                </span>
                <span 
                  className={`${isEasyMode ? 'text-xl' : 'text-sm'} font-medium flex items-center gap-2`}
                  style={{ color: '#7B8B4F' }}
                >
                  <div className={`${isEasyMode ? 'w-3 h-3' : 'w-2 h-2'} rounded-full`} style={{ backgroundColor: '#7B8B4F' }} />
                  {watchData.status}
                </span>
              </div>

              <div className={`flex justify-between items-center ${isEasyMode ? 'py-4' : 'py-2'}`}>
                <span className={isEasyMode ? 'text-xl' : 'text-sm'} style={{ color: '#4A3228', opacity: 0.7 }}>
                  마지막 동기화
                </span>
                <span className={isEasyMode ? 'text-xl' : 'text-sm'} style={{ color: '#4A3228' }}>
                  {watchData.lastSync}
                </span>
              </div>

              <div className={`flex justify-between items-center ${isEasyMode ? 'py-4' : 'py-2'}`}>
                <span className={isEasyMode ? 'text-xl' : 'text-sm'} style={{ color: '#4A3228', opacity: 0.7 }}>
                  워치 모델
                </span>
                <span className={isEasyMode ? 'text-xl' : 'text-sm'} style={{ color: '#4A3228' }}>
                  {watchData.model}
                </span>
              </div>
            </div>

            {/* Separator */}
            <div 
              className="h-px my-4"
              style={{ backgroundColor: '#E6E0D6' }}
            />

            {/* Disconnect Button */}
            <Button
              onClick={() => setShowDisconnectDialog(true)}
              variant="outline"
              className={`w-full ${isEasyMode ? 'text-xl py-6' : ''}`}
              style={{ 
                borderColor: '#C44545', 
                color: '#C44545',
                backgroundColor: 'transparent'
              }}
            >
              연결 해제하기
            </Button>
          </CardContent>
        </Card>

        {/* Disconnect Confirmation Dialog */}
        <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
          <AlertDialogContent 
            className="max-w-sm"
            style={{ backgroundColor: 'white', borderRadius: '16px' }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className={isEasyMode ? 'text-2xl' : ''} style={{ color: '#4A3228' }}>
                정말 연결을 해제하시겠습니까?
              </AlertDialogTitle>
              <AlertDialogDescription className={isEasyMode ? 'text-lg' : ''} style={{ color: '#4A3228', opacity: 0.6 }}>
                해제하면 워치 데이터가 더 이상 동기화되지 않습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                className={isEasyMode ? 'text-xl py-6' : ''}
                style={{ 
                  borderColor: '#E6E0D6',
                  color: '#4A3228'
                }}
              >
                취소
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDisconnect}
                className={isEasyMode ? 'text-xl py-6' : ''}
                style={{ 
                  backgroundColor: '#C44545',
                  color: 'white'
                }}
              >
                해제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return null;
}