import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import {
  ArrowLeft,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Watch,
  FileAudio
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface WatchSTTUploadProps {
  onBack?: () => void;
  onComplete?: (diaryId: number, date: string, content: string) => void;
}

type UploadStep = 'select' | 'uploading' | 'transcribing' | 'saving' | 'success' | 'error';

interface UploadResult {
  diaryId: number;
  date: string;
  content: string;
}

export function WatchSTTUpload({ onBack, onComplete }: WatchSTTUploadProps) {
  const [step, setStep] = useState<UploadStep>('select');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('오디오 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('파일 크기는 50MB 이하여야 합니다.');
      return;
    }

    setSelectedFile(file);
    startUploadProcess(file);
  };

  const startUploadProcess = async (file: File) => {
    // Step 1: Uploading
    setStep('uploading');
    setProgress(0);

    const uploadInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(uploadInterval);
      setProgress(100);
      
      // Step 2: Transcribing
      setTimeout(() => {
        setStep('transcribing');
        setProgress(0);

        const transcribeInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(transcribeInterval);
              return 100;
            }
            return prev + 5;
          });
        }, 300);

        setTimeout(() => {
          clearInterval(transcribeInterval);
          setProgress(100);

          // Step 3: Saving
          setTimeout(() => {
            setStep('saving');
            setProgress(0);

            const saveInterval = setInterval(() => {
              setProgress(prev => {
                if (prev >= 100) {
                  clearInterval(saveInterval);
                  return 100;
                }
                return prev + 20;
              });
            }, 100);

            setTimeout(() => {
              clearInterval(saveInterval);
              setProgress(100);

              // Success
              const today = new Date().toISOString().split('T')[0];
              const mockResult: UploadResult = {
                diaryId: Math.floor(Math.random() * 10000),
                date: today,
                content: '워치에서 녹음된 음성입니다. 오늘 하루 정말 좋았어요. 운동도 하고 친구들과 즐거운 시간을 보냈습니다. 건강한 하루를 보낸 것 같아서 기분이 좋습니다.'
              };

              setResult(mockResult);
              setStep('success');
              toast.success('일기가 자동으로 저장되었습니다!');
            }, 500);
          }, 500);
        }, 4000);
      }, 500);
    }, 2000);
  };

  const handleRetry = () => {
    setStep('select');
    setProgress(0);
    setSelectedFile(null);
    setErrorMessage('');
  };

  const handleViewDiary = () => {
    if (result) {
      onComplete?.(result.diaryId, result.date, result.content);
    }
  };

  const getStepInfo = () => {
    switch (step) {
      case 'uploading':
        return {
          icon: <Upload className="w-12 h-12 animate-pulse" style={{ color: '#7B8B4F' }} />,
          title: '파일 업로드 중...',
          description: '워치에서 녹음된 오디오를 업로드하고 있습니다.'
        };
      case 'transcribing':
        return {
          icon: <FileAudio className="w-12 h-12 animate-pulse" style={{ color: '#7B8B4F' }} />,
          title: '음성 변환 중...',
          description: '오디오를 텍스트로 변환하고 있습니다.'
        };
      case 'saving':
        return {
          icon: <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#7B8B4F' }} />,
          title: '일기 저장 중...',
          description: '오늘 날짜로 일기를 자동 저장하고 있습니다.'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12" style={{ color: '#7B8B4F' }} />,
          title: '완료!',
          description: '일기가 성공적으로 저장되었습니다.'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-12 h-12 text-red-500" />,
          title: '오류 발생',
          description: errorMessage || '업로드 중 문제가 발생했습니다.'
        };
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20" style={{ backgroundColor: '#F5F1E8' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="-ml-2 gap-1">
          <ArrowLeft className="w-4 h-4" />
          뒤로
        </Button>
        <h1 className="text-xl" style={{ color: '#4A3228' }}>
          워치 일기 업로드
        </h1>
        <div className="w-16" />
      </div>

      {/* Info Card */}
      <Card className="bg-white mb-4" style={{ borderColor: '#E6E0D6' }}>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Watch className="w-6 h-6 flex-shrink-0" style={{ color: '#7B8B4F' }} />
            <div>
              <h3 className="font-medium mb-1" style={{ color: '#4A3228' }}>
                스마트 워치 연동
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                워치에서 녹음한 음성 일기를 업로드하면 자동으로 텍스트로 변환되어 오늘 날짜로 저장됩니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      {step === 'select' && (
        <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
          <CardContent className="p-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-12 border-2 border-dashed rounded-lg transition-all hover:bg-gray-50 flex flex-col items-center gap-4"
              style={{ borderColor: '#E6E0D6' }}
            >
              <Upload className="w-16 h-16" style={{ color: '#7B8B4F' }} />
              <div className="text-center">
                <p className="font-medium mb-1" style={{ color: '#4A3228' }}>
                  오디오 파일 선택
                </p>
                <p className="text-sm text-gray-500">
                  또는 파일을 여기에 드롭하세요
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  지원 형식: MP3, WAV, M4A (최대 50MB)
                </p>
              </div>
            </button>
          </CardContent>
        </Card>
      )}

      {/* Processing Steps */}
      {(step === 'uploading' || step === 'transcribing' || step === 'saving') && (
        <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              {getStepInfo()?.icon}
              <div>
                <h3 className="font-medium mb-2" style={{ color: '#4A3228' }}>
                  {getStepInfo()?.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {getStepInfo()?.description}
                </p>
              </div>
              <div className="w-full max-w-sm">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">{progress}%</p>
              </div>
              {selectedFile && (
                <div className="mt-4 p-3 rounded-lg w-full max-w-sm" style={{ backgroundColor: '#F5F1E8' }}>
                  <p className="text-xs text-gray-600 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success */}
      {step === 'success' && result && (
        <div className="space-y-4">
          <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                {getStepInfo()?.icon}
                <div>
                  <h3 className="font-medium mb-2" style={{ color: '#4A3228' }}>
                    {getStepInfo()?.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getStepInfo()?.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-medium" style={{ color: '#4A3228' }}>
                저장된 일기 미리보기
              </h3>
              <Separator style={{ backgroundColor: '#E6E0D6' }} />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">일기 ID</span>
                  <span style={{ color: '#4A3228' }}>#{result.diaryId}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">날짜</span>
                  <span style={{ color: '#4A3228' }}>
                    {format(new Date(result.date), 'PPP', { locale: ko })}
                  </span>
                </div>
              </div>

              <Separator style={{ backgroundColor: '#E6E0D6' }} />

              <div>
                <p className="text-sm text-gray-600 mb-2">내용</p>
                <p className="text-sm leading-relaxed p-3 rounded-lg" style={{ backgroundColor: '#F5F1E8', color: '#4A3228' }}>
                  {result.content}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleViewDiary}
              className="flex-1 text-white"
              style={{ backgroundColor: '#7B8B4F' }}
            >
              일기 보기
            </Button>
            <Button
              onClick={handleRetry}
              variant="outline"
              className="flex-1"
              style={{ borderColor: '#E6E0D6' }}
            >
              다시 업로드
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {step === 'error' && (
        <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              {getStepInfo()?.icon}
              <div>
                <h3 className="font-medium mb-2 text-red-600">
                  {getStepInfo()?.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {getStepInfo()?.description}
                </p>
              </div>
              <Button
                onClick={handleRetry}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                다시 시도
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps Indicator */}
      {step !== 'select' && step !== 'error' && (
        <Card className="mt-4 bg-white" style={{ borderColor: '#E6E0D6' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs">
              <div className={`flex-1 text-center ${step === 'uploading' || step === 'transcribing' || step === 'saving' || step === 'success' ? 'text-[#7B8B4F]' : 'text-gray-400'}`}>
                <p>1. 업로드</p>
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`flex-1 text-center ${step === 'transcribing' || step === 'saving' || step === 'success' ? 'text-[#7B8B4F]' : 'text-gray-400'}`}>
                <p>2. 변환</p>
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`flex-1 text-center ${step === 'saving' || step === 'success' ? 'text-[#7B8B4F]' : 'text-gray-400'}`}>
                <p>3. 저장</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
