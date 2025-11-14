import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft, Upload, X, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2, BookOpen, Notebook, PenTool } from 'lucide-react';
import { HandwritingCanvas } from './HandwritingCanvas';
import { toast } from 'sonner';
import { EmotionType } from './types';

type OCRStatus = 'idle' | 'uploading' | 'success' | 'error' | 'limit_exceeded' | 'saving';

interface OCRPreviewProps {
  onBack: () => void;
  onSave?: (data: OCRSaveData) => void;
  onStartAnalysis?: () => void;
}

export interface OCRSaveData {
  userId: string;
  content: string;
  imageUrl: string;
  date: string;
  keywordIds?: number[];
  emotionType?: EmotionType;
  template?: string;
  canvasImage?: string;
}

// OCR 템플릿 타입
type OCRTemplate = 'blank' | 'diary' | 'grid' | 'lined';

const templates = [
  {
    id: 'blank' as OCRTemplate,
    name: '자유 작성',
    icon: PenTool,
    description: '빈 캔버스에 자유롭게 작성',
    background: 'bg-white'
  },
  {
    id: 'diary' as OCRTemplate,
    name: '그림일기',
    icon: BookOpen,
    description: '위에 그림, 아래 글 영역',
    background: 'bg-gradient-to-b from-blue-50 via-white to-yellow-50'
  },
  {
    id: 'lined' as OCRTemplate,
    name: '줄 노트',
    icon: Notebook,
    description: '가로줄이 있는 노트',
    background: 'bg-white'
  },
];

export function OCRPreview({ onBack, onSave, onStartAnalysis }: OCRPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<OCRStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<OCRTemplate>('blank');
  const [canvasImageData, setCanvasImageData] = useState<string>('');
  
  // 날짜 선택
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [selectedDay, setSelectedDay] = useState(currentDay.toString());
  
  // 키워드 관리
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  
  // 감정 선택
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | 'none'>('none');
  
  // 다이얼로그
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 년/월/일 옵션
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const getAvailableMonths = () => {
    if (parseInt(selectedYear) === currentYear) {
      return Array.from({ length: currentMonth }, (_, i) => i + 1);
    }
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };
  const months = getAvailableMonths();
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const getAvailableDays = () => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const maxDays = getDaysInMonth(year, month);
    
    if (year === currentYear && month === currentMonth) {
      return Array.from({ length: currentDay }, (_, i) => i + 1);
    }
    return Array.from({ length: maxDays }, (_, i) => i + 1);
  };
  const days = getAvailableDays();

  const emotions: EmotionType[] = ['기쁨', '슬픔', '분노', '예민', '무기력'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('지원하지 않는 파일 형식입니다.');
      return;
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // 기존 결과 초기화
    setExtractedText('');
    setImageUrl('');
    setFilename('');
    setStatus('idle');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setExtractedText('');
    setImageUrl('');
    setFilename('');
    setStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      toast.error('이미지를 선택해주세요.');
      return;
    }

    setStatus('uploading');

    // Mock API call - 실제로는 POST /api/ocr/preview 호출
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('user_id', 'mock-user-id'); // 실제로는 인증된 사용자 ID

      // Mock response
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success response
      const mockText = `안녕하세요!
오늘은 정말 좋은 날이었어요.
아침에 일어나서 창밖을 보니
햇살이 너무 따뜻했습니다.`;

      setExtractedText(mockText);
      setImageUrl('https://storage.googleapis.com/mock-bucket/image.jpg');
      setFilename('uploaded-image-123.jpg');
      setStatus('success');
      toast.success('텍스트 추출이 완료되었습니다!');
    } catch (error: any) {
      setStatus('error');
      if (error.status === 403) {
        setErrorMessage('오늘은 이미 사용했습니다. 자정 이후 다시 시도해 주세요.');
      } else if (error.status === 415) {
        setErrorMessage('지원하지 않는 파일 형식입니다.');
      } else {
        setErrorMessage('지금은 처리할 수 없어요. 잠시 후 다시 시도해 주세요.');
      }
      setShowErrorDialog(true);
    }
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) {
      toast.error('키워드를 입력해주세요.');
      return;
    }
    if (keywords.includes(newKeyword.trim())) {
      toast.error('이미 추가된 키워드입니다.');
      return;
    }
    if (keywords.length >= 5) {
      toast.error('키워드는 최대 5개까지만 추가할 수 있습니다.');
      return;
    }
    setKeywords([...keywords, newKeyword.trim()]);
    setNewKeyword('');
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleSaveAsDiary = async () => {
    if (!extractedText.trim()) {
      toast.error('추출된 텍스트가 없습니다.');
      return;
    }

    if (!selectedYear || !selectedMonth || !selectedDay) {
      toast.error('날짜를 선택해주세요.');
      return;
    }

    setStatus('saving');

    try {
      const saveData: OCRSaveData = {
        userId: 'mock-user-id',
        content: extractedText,
        imageUrl: imageUrl,
        date: `${selectedYear}-${selectedMonth.padStart(2, '0')}-${selectedDay.padStart(2, '0')}`,
        keywordIds: keywords.map((_, idx) => idx),
        emotionType: selectedEmotion !== 'none' ? selectedEmotion : undefined,
        template: selectedTemplate,
        canvasImage: canvasImageData
      };

      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('저장했어요. 감정 분석을 시작합니다.');
      
      if (onSave) {
        onSave(saveData);
      }

      // 감정 분석 화면으로 이동
      if (onStartAnalysis) {
        onStartAnalysis();
      } else {
        onBack();
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setShowErrorDialog(true);
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
          손글씨 일기
        </h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* 설명 */}
      <Card className="bg-card mb-4 border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="text-sm text-foreground">
                직접 손글씨를 작성하거나 이미지를 업로드하여 텍스트를 추출합니다.
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                하루 1회만 사용 가능합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 */}
      <Tabs defaultValue="write" className="mb-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write">손글씨 작성</TabsTrigger>
          <TabsTrigger value="upload">이미지 업로드</TabsTrigger>
        </TabsList>

        {/* 손글씨 작성 탭 */}
        <TabsContent value="write">
          {/* 템플릿 선택 */}
          <Card className="bg-card border-border mb-4">
            <CardContent className="p-4">
              <Label className="text-sm mb-3 block text-foreground">
                템플릿 선택
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {templates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-1 ${
                        selectedTemplate === template.id ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <p className="text-xs text-center text-foreground">{template.name}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <HandwritingCanvas
                template={selectedTemplate}
                onSave={async (blob, imageData) => {
                  setCanvasImageData(imageData);
                  const file = new File([blob], `handwriting-${Date.now()}.png`, { type: 'image/png' });
                  setSelectedFile(file);
                  setPreviewUrl(URL.createObjectURL(blob));
                  
                  toast.success('손글씨가 저장되었습니다. OCR을 진행합니다.');
                  
                  // 자동으로 OCR 처리 시작
                  setStatus('uploading');
                  
                  try {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    const mockText = `오늘 하루는 정말 좋은 날이었어요.
아침에 일어나서 창밖을 보니
햇살이 너무 따뜻했습니다.
친구들과 만나서 즐거운 시간을 보냈어요.`;

                    setExtractedText(mockText);
                    setImageUrl('https://storage.googleapis.com/mock-bucket/image.jpg');
                    setFilename('handwriting-image.jpg');
                    setStatus('success');
                    toast.success('텍스트 추출이 완료되었습니다!');
                  } catch (error: any) {
                    setStatus('error');
                    setErrorMessage('지금은 처리할 수 없어요. 잠시 후 다시 시도해 주세요.');
                    setShowErrorDialog(true);
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 이미지 업로드 탭 */}
        <TabsContent value="upload">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 좌측: 이미지 업로더 */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <Label className="text-sm mb-3 block text-foreground">
                  이미지 업로드
                </Label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/heic,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onClick={handleUploadClick}
                    className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                    style={{ minHeight: '200px' }}
                  >
                    <ImageIcon className="w-12 h-12 mb-3 text-primary" />
                    <p className="text-sm mb-1 text-foreground">
                      클릭하여 이미지 선택
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, HEIC, WebP (최대 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden bg-muted">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-contain"
                      />
                      <button
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-card shadow-md hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm truncate text-foreground">
                        {selectedFile.name}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUploadClick}
                      >
                        재선택
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 우측: 텍스트 미리보기 */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <Label className="text-sm mb-3 block text-foreground">
                  추출 텍스트
                </Label>

                <div className="border border-border rounded-lg p-3 bg-muted/30" style={{ minHeight: '200px' }}>
                  {status === 'uploading' ? (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                      <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        이미지에서 텍스트를 추출하는 중…
                      </p>
                    </div>
                  ) : extractedText ? (
                    <div className="whitespace-pre-wrap text-sm text-foreground">
                      {extractedText}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full py-12">
                      <p className="text-sm text-center text-muted-foreground">
                        아직 미리보기가 없습니다.<br />
                        이미지를 업로드하고 미리보기를 실행해주세요.
                      </p>
                    </div>
                  )}
                </div>

                {selectedFile && status !== 'uploading' && status !== 'success' && (
                  <Button
                    onClick={handlePreview}
                    className="w-full mt-3 text-white bg-primary hover:bg-primary/90"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    미리보기 실행
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 날짜 선택 */}
      {status === 'success' && (
        <>
          <Card className="bg-card mb-4 border-border">
            <CardContent className="p-4">
              <Label className="text-sm mb-3 block text-foreground">
                추출된 텍스트
              </Label>
              <Textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="min-h-[200px] border-border resize-none bg-background text-foreground"
                placeholder="추출된 텍스트를 편집할 수 있습니다..."
              />
              <div className="flex justify-end mt-2">
                <span className="text-xs text-muted-foreground">
                  {extractedText.length}자
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
              style={{ borderColor: '#E6E0D6', color: '#4A3228' }}
            >
              취소
            </Button>
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
        </>
      )}

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
