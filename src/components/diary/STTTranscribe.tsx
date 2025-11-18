import React, { useState, useRef } from 'react';
import api from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft, X, Mic, Square, Loader2, AlertCircle, CheckCircle2, FileAudio, Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { EmotionType } from './types';

type STTStatus = 'idle' | 'transcribing' | 'success' | 'error' | 'limit_exceeded' | 'saving';
type RecordingStatus = 'idle' | 'recording' | 'stopped';

interface STTTranscribeProps {
  onBack: () => void;
  onSave?: (data: STTSaveData) => void;

  onStartAnalysis?: (analysisRequest: {
    diaryId: number;
    genreIds: number[];
    text: string;
  }) => void;

  selectedDate: string;
  userKeywords: { id: number, content: string }[];
}

export interface STTSaveData {
  userId: string;
  content: string;
  date: string;
  keywordIds?: number[];
  emotionType?: EmotionType;
}

export function STTTranscribe({ onBack, onSave, onStartAnalysis, selectedDate, userKeywords }: STTTranscribeProps) {
  console.log("📅 [DEBUG] STTTranscribe props.selectedDate =", selectedDate);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [status, setStatus] = useState<STTStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [doVad, setDoVad] = useState(true);
  const [contentTooShort, setContentTooShort] = useState(false);
  
  // 녹음 관련 상태
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  
  // 마이크 권한 체크
  React.useEffect(() => {
    const checkMicPermission = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermissionStatus(result.state);
          console.log('🎤 마이크 권한 상태:', result.state);
          
          // 권한 상태 변경 감지
          result.addEventListener('change', () => {
            setPermissionStatus(result.state);
            console.log('🔄 마이크 권한 변경됨:', result.state);
            if (result.state === 'granted') {
              setPermissionDenied(false);
              toast.success('마이크 권한이 허용되었습니다! 이제 녹음을 시작할 수 있습니다.');
            }
          });
        }
      } catch (error) {
        console.log('⚠️ 권한 체크 API 지원 안 됨 (일부 브라우저는 지원하지 않음)');
      }
    };
    
    checkMicPermission();
  }, []);
  
  // 키워드 관리
  const [keywords, setKeywords] = useState<string[]>([]);
  const realKeywordIds = userKeywords
    .filter(kw => keywords.includes(kw.content))
    .map(kw => kw.id);
  
  // 감정 선택
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | 'none'>('none');
  
  // 다이얼로그
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['audio/wav', 'audio/x-m4a', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/webm'];
    const validExtensions = ['.wav', '.m4a', '.mp4', '.mp3', '.mpeg', '.ogg', '.webm'];
    
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const isValidType = validTypes.includes(file.type) || validExtensions.includes(fileExtension);
    
    if (!isValidType) {
      toast.error('지원하지 않는 파일 형식입니다.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('파일 크기는 25MB 이하여야 합니다.');
      return;
    }

    setSelectedFile(file);
    setTranscribedText('');
    setStatus('idle');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setTranscribedText('');
    setStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 녹음 시작
  const handleStartRecording = async () => {
    try {
      console.log('🎤 녹음 시작 시도...');
      
      // 브라우저 지원 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('이 브라우저는 마이크 녹음을 지원하지 않습니다.');
        console.error('❌ MediaDevices API not supported');
        return;
      }

      console.log('✅ MediaDevices API 지원됨');
      console.log('🔍 마이크 권한 요청 중...');
      
      // 마이크 권한 요청 및 스트림 가져오기
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      console.log('✅ 마이크 권한 승인됨');
      console.log('📊 오디오 트랙:', stream.getAudioTracks());
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          console.log('📦 오디오 청크 수신:', event.data.size, 'bytes');
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('⏹️ 녹음 중지됨');
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        console.log('💾 최종 오디오 크기:', audioBlob.size, 'bytes');
        setRecordedAudio(audioBlob);
        setRecordedUrl(URL.createObjectURL(audioBlob));
        
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 트랙 중지:', track.label);
        });
        
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder 오류:', event);
        toast.error('녹음 중 오류가 발생했습니다.');
      };
      
      mediaRecorder.start();
      console.log('🎙️ 녹음 시작됨, 상태:', mediaRecorder.state);
      
      setRecordingStatus('recording');
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success('녹음이 시작되었습니다.');
    } catch (error: any) {
      console.error('❌ 마이크 접근 오류:', error);
      console.error('오류 이름:', error.name);
      console.error('오류 메시지:', error.message);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        toast.error('마이크 권한이 거부되었습니다. 브라우저 주소창 왼쪽의 자물쇠 아이콘을 클릭하여 마이크 권한을 허용해주세요.', {
          duration: 5000
        });
        setPermissionDenied(true);
        setPermissionStatus('denied');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        toast.error('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.');
        setPermissionStatus('denied');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        toast.error('마이크가 다른 앱에서 사용 중입니다. 다른 앱을 종료하고 다시 시도해주세요.');
        setPermissionStatus('denied');
      } else if (error.name === 'OverconstrainedError') {
        toast.error('마이크 설정이 맞지 않습니다. 다른 마이크를 시도해주세요.');
        setPermissionStatus('denied');
      } else if (error.name === 'SecurityError') {
        toast.error('보안 문제로 마이크에 접근할 수 없습니다.');
        setPermissionStatus('denied');
      } else {
        toast.error('마이크 접근 중 오류가 발생했습니다: ' + error.message);
        setPermissionStatus('denied');
      }
    }
  };

  // 녹음 중지
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingStatus('stopped');
      toast.success('녹음이 완료되었습니다.');
    }
  };

  // 녹음 재생
  const handlePlayRecording = () => {
    if (recordedUrl) {
      const audio = new Audio(recordedUrl);
      audio.play();
    }
  };

  // 녹음 삭제
  const handleDeleteRecording = () => {
    setRecordedAudio(null);
    setRecordedUrl(null);
    setRecordingStatus('idle');
    setRecordingTime(0);
    toast.success('녹음이 삭제되었습니다.');
  };

  // 녹음 파일로 변환
  const handleTranscribeRecording = async () => {
    if (!recordedAudio) {
      toast.error('녹음된 오디오가 없습니다.');
      return;
    }

    const file = new File([recordedAudio], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
    await handleTranscribeFile(file);
  };

  const handleTranscribe = async () => {
    if (!selectedFile) {
      toast.error('오디오 파일을 선택해주세요.');
      return;
    }

    await handleTranscribeFile(selectedFile);
  };

  // stt id 저장
  const [sttId, setSttId] = useState<number | null>(null);

  const handleTranscribeFile = async (file: File) => {
    setStatus('transcribing');

    try {
      const userId = Number(localStorage.getItem("user_id"));
      if (!userId) {
        toast.error("로그인 정보가 없습니다.");
        setStatus("error");
        return;
      }

      const diaryDate = new Date().toISOString().split("T")[0];
      console.log("📤 [DEBUG] STT API 요청 날짜 =", diaryDate);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append("user_id", userId);
      formData.append("diary_date", diaryDate);
      formData.append('do_vad', doVad.toString());

      console.log("📤 STT API 요청 formData:", {
        file: file.name,
        user_id: userId,
        diary_date: diaryDate,
        do_vad: doVad,
      });

      const sttRes = await api.post("/ai/stt/transcribe", formData, {
        baseURL: "https://sote-ai.onrender.com",
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("🟢 STT API 응답:", sttRes.data);

      const { text, spring_id } = sttRes.data;
      console.log("🟢 STT 응답 spring_id:", spring_id);

      if (!text) {
        toast.error("검사 결과가 비어 있어요. 다시 시도해 주세요.");
        setStatus("error");
        return;
      }

      setSttId(spring_id);
      setTranscribedText(text);
      setStatus('success');

      toast.success('음성 변환이 완료되었습니다!');
    } catch (error: any) {
      console.error("❌ STT 변환 실패:", error);

      if (error?.response?.status === 429) {
        toast.error("오늘의 음성 분석 사용량을 초과했습니다.");
        setStatus("limit_exceeded");
        return;
      }

      toast.error("변환 처리 중 오류가 발생했습니다.");
      setErrorMessage("지금은 처리할 수 없어요. 잠시 후 다시 시도해주세요.");
      setShowErrorDialog(true);
      setStatus("error");
    }
  };

  const handleSaveAsDiary = async () => {
    console.log("🟢 [DEBUG] --- handleSaveAsDiary() 실행됨 ---");
    console.log("📅 selectedDate =", selectedDate);
    console.log("📝 transcribedText =", transcribedText);
    console.log("🔑 realKeywordIds =", realKeywordIds);
    console.log("💛 selectedEmotion =", selectedEmotion);
    console.log("🔊 sttId =", sttId);

    const userId = localStorage.getItem("user_id");

    console.log("📦 최종적으로 DiaryEntry로 전달될 onSave payload:", {
      content: transcribedText,
      date: selectedDate,
      keywordIds: realKeywordIds,
      emotionType: selectedEmotion !== "none" ? selectedEmotion : null,
      sttId: Number(sttId),
    });
    
    if (!sttId) {
      console.log("❌ [DEBUG] sttId 없음 -> 저장 중단");
      toast.error("STT ID가 없어 저장할 수 없어요.");
      return;
    }

    if (!transcribedText.trim()) {
      toast.error('변환된 텍스트가 없습니다.');
      return;
    }

    if (transcribedText.trim().length < 10) {
      console.error('일기 내용이 너무 짧습니다. 최소 10자 이상 작성해주세요.');
      setContentTooShort(true);
      return;
    }
    setContentTooShort(false);

    setStatus('saving');

    try {
      const token = localStorage.getItem("accessToken");

      if (!token || !userId) {
        toast.error("로그인 정보가 없습니다.");
        return;
      }
      
      if (onSave) {
        onSave({
          content: transcribedText,
          date: selectedDate,
          keywordIds: realKeywordIds,
          emotionType: selectedEmotion !== "none" ? selectedEmotion : null,
          sttId: sttId // 이건 부모가 쓸 수 있게 전달만
        });
      };
      
      toast.success("저장 완료! 감정 분석을 시작합니다.");
      console.log("저장 완료! 감정 분석을 시작합니다.")

      // 감정 분석 화면으로 이동
      if (onStartAnalysis) {
        onStartAnalysis({
          diaryId,
          genreIds: [],
          text: transcribedText
        });
      }
      setStatus("success");
    } catch (error) {
      console.error("❌ 저장 실패:", error);
      toast.error("저장 중 문제가 발생했습니다.");
      setStatus("error");
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessDialog(false);
    onBack();
  };

  return (
    <div className="min-h-screen p-4 pb-20 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-2 text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl text-foreground">
          음성 일기
        </h1>
        <div className="w-9" />
      </div>

      {/* 설명 */}
      <Card className="bg-card mb-4 border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="text-sm text-foreground">
                녹음 또는 오디오 파일 업로드 후 텍스트로 변환합니다.
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                하루 1회만 사용 가능합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 디버깅 안내 */}
      <Card className="mb-4 bg-primary/10 border-primary">
        <CardContent className="p-3">
          <p className="text-xs mb-2 text-foreground">
            💡 <strong>녹음이 안 되나요?</strong>
          </p>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• 브라우저 콘솔(F12)을 열어 로그를 확인하세요</li>
            <li>• 주소창 왼쪽 자물쇠 아이콘에서 마이크 권한 확인</li>
            <li>• 마이크가 컴퓨터에 제대로 연결되어 있는지 확인</li>
            <li>• Chrome/Edge 브라우저 권장</li>
          </ul>
        </CardContent>
      </Card>

      {/* 권한 거부 시 상세 안내 */}
      {permissionDenied && (
        <Card className="mb-4 bg-red-50 dark:bg-red-950/20 border-red-500 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500 dark:text-red-400" />
              <div>
                <p className="text-sm mb-2 text-foreground">
                  <strong>마이크 권한이 차단되었습니다</strong>
                </p>
                <p className="text-xs mb-3 text-muted-foreground">
                  아래 단계를 따라 권한을 허용해주세요:
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex gap-2">
                <span className="text-xs shrink-0 text-foreground">1.</span>
                <p className="text-xs text-muted-foreground">
                  브라우저 주소창 <strong>왼쪽의 🔒 자물쇠 아이콘</strong> 또는 <strong>ⓘ 정보 아이콘</strong> 클릭
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs shrink-0 text-foreground">2.</span>
                <p className="text-xs text-muted-foreground">
                  "사이트 설정" 또는 "권한" 클릭
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs shrink-0 text-foreground">3.</span>
                <p className="text-xs text-muted-foreground">
                  <strong>마이크</strong>를 찾아서 <strong>"허용"</strong>으로 변경
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs shrink-0 text-foreground">4.</span>
                <p className="text-xs text-muted-foreground">
                  권한 변경 후 아래 버튼을 눌러 다시 시도하세요
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setPermissionDenied(false);
                toast.success('권한을 허용한 후 "녹음 시작" 버튼을 다시 클릭하세요.');
              }}
              size="sm"
              className="w-full text-white bg-primary hover:bg-primary/90"
            >
              권한 설정 완료
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 탭 */}
      <Tabs defaultValue="record" className="mb-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="record">녹음하기</TabsTrigger>
          <TabsTrigger value="upload">파일 업로드</TabsTrigger>
        </TabsList>

        {/* 녹음 탭 */}
        <TabsContent value="record">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                {/* 녹음 상태 아이콘 */}
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all ${
                    recordingStatus === 'recording' ? 'animate-pulse bg-red-50 dark:bg-red-950/20' : 'bg-primary/10'
                  }`}
                  style={{ 
                    boxShadow: recordingStatus === 'recording' ? '0 0 20px rgba(239, 68, 68, 0.3)' : 'none'
                  }}
                >
                  {recordingStatus === 'recording' ? (
                    <Square className="w-10 h-10 text-red-500 dark:text-red-400" />
                  ) : (
                    <Mic className="w-10 h-10 text-primary" />
                  )}
                </div>

                {/* 녹음 시간 */}
                {recordingStatus === 'recording' && (
                  <div className="mb-4 text-center">
                    <p className="text-3xl mb-1 text-red-500 dark:text-red-400">
                      {formatTime(recordingTime)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      녹음 중...
                    </p>
                  </div>
                )}

                {/* 녹음 대기 상태 */}
                {recordingStatus === 'idle' && (
                  <div className="mb-4 text-center">
                    <p className="text-sm mb-3 text-muted-foreground">
                      녹음을 시작하려면 아래 버튼을 클릭하세요
                    </p>
                    <Button
                      onClick={handleStartRecording}
                      className="text-white bg-primary hover:bg-primary/90"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      녹음 시작
                    </Button>
                  </div>
                )}

                {/* 녹음 중 */}
                {recordingStatus === 'recording' && (
                  <Button
                    onClick={handleStopRecording}
                    className="mb-4 text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    녹음 중지
                  </Button>
                )}

                {recordingStatus === 'stopped' && recordedAudio && (
                  <div className="w-full space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                      <FileAudio className="w-8 h-8 shrink-0 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          녹음 완료 ({formatTime(recordingTime)})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(recordedAudio.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handlePlayRecording}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        재생
                      </Button>
                      <Button
                        onClick={handleDeleteRecording}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제
                      </Button>
                    </div>

                    <Button
                      onClick={handleTranscribeRecording}
                      className="w-full text-white bg-primary hover:bg-primary/90"
                    >
                      텍스트로 변환
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 파일 업로드 탭 */}
        <TabsContent value="upload">
          <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
            <CardContent className="p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/wav,audio/x-m4a,audio/mp4,audio/mpeg,audio/ogg,audio/webm,.wav,.m4a,.mp4,.mp3,.mpeg,.ogg,.webm"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!selectedFile ? (
                <div
                  onClick={handleUploadClick}
                  className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                  style={{ minHeight: '200px' }}
                >
                  <FileAudio className="w-12 h-12 mb-3 text-primary" />
                  <p className="text-sm mb-1 text-foreground">
                    클릭하여 오디오 선택
                  </p>
                  <p className="text-xs text-center text-muted-foreground">
                    WAV, M4A, MP4, MP3, OGG, WebM<br />
                    (최대 25MB, 권장: 5분 이내)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                    <FileAudio className="w-8 h-8 shrink-0 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate text-foreground">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-1.5 rounded-full hover:bg-card transition-colors"
                    >
                      <X className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUploadClick}
                    className="w-full"
                  >
                    재선택
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 변환 옵션 */}
      {(selectedFile || recordedAudio) && status !== 'success' && (
        <Card className="bg-card mb-4 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-foreground">
                  무음 제거
                </Label>
                <p className="text-xs mt-1 text-muted-foreground">
                  긴 침묵 구간을 자동으로 제거합니다
                </p>
              </div>
              <Switch
                checked={doVad}
                onCheckedChange={setDoVad}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 변환 버튼 (파일 업로드용) */}
      {selectedFile && status !== 'transcribing' && status !== 'success' && (
        <Button
          onClick={handleTranscribe}
          className="w-full mb-4 text-white bg-primary hover:bg-primary/90"
        >
          <Mic className="w-4 h-4 mr-2" />
          텍스트로 변환
        </Button>
      )}

      {/* 변환 진행 중 */}
      {status === 'transcribing' && (
        <Card className="bg-card mb-4 border-border">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
              <p className="text-sm text-foreground">
                오디오를 텍스트로 변환하는 중…
              </p>
              <p className="text-xs mt-2 text-muted-foreground">
                파일 크기에 따라 시간이 걸릴 수 있습니다
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 변환 결과 */}
      {status === 'success' && (
        <>
          <Card className="bg-card mb-4 border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm text-foreground">
                  변환된 텍스트
                </Label>
                <span className="text-xs text-muted-foreground">
                  {transcribedText.length}자
                </span>
              </div>

              <Textarea
                value={transcribedText}
                onChange={(e) => setTranscribedText(e.target.value)}
                className="min-h-[200px] border-border resize-none bg-background text-foreground"
                placeholder="변환된 텍스트를 편집할 수 있습니다..."
              />
            </CardContent>
          </Card>

          {/* 🔥 여기에 위치해야 화면에 바로 보인다 */}
          {contentTooShort && (
            <p className="text-red-500 text-sm mb-3 text-center">
              일기 내용이 너무 짧아요. 최소 10자 이상 입력해주세요.
            </p>
          )}

          {/* 하단 버튼 */}
          <div className="flex gap-3 mb-3">
            <Button
              onClick={handleSaveAsDiary}
              disabled={status === 'saving'}
              className="flex-1 text-white bg-accent hover:bg-accent/90"
            >
              {status === 'saving' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장하기'
              )}
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={onBack}
            className="w-full"
          >
            취소
          </Button>
        </>
      )}

      {/* 성공 다이얼로그 */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="border-border">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center text-foreground">
              저장 완료
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              저장했어요. 감정 분석을 시작합니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleSuccessConfirm}
              className="w-full text-white bg-primary hover:bg-primary/90"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 오류 다이얼로그 */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="border-border">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-foreground">
              오류 발생
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowErrorDialog(false)}
              className="w-full text-white bg-accent hover:bg-accent/90"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}