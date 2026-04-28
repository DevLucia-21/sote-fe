import React, { useRef, useState } from 'react';
import axios from 'axios';
import api from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft, Upload, X, Image as ImageIcon, Loader2, AlertCircle, BookOpen, Notebook, PenTool } from 'lucide-react';
import { HandwritingCanvas } from './HandwritingCanvas';
import { toast } from 'sonner';
import { EmotionType } from './types';

type OCRStatus = 'idle' | 'uploading' | 'success' | 'error' | 'limit_exceeded' | 'saving';
type OCRTemplate = 'blank' | 'diary' | 'grid' | 'lined';

const AI_BASE_URL = (import.meta.env.VITE_AI_BASE_URL || '').replace(/\/$/, '');

interface OCRPreviewProps {
  onBack: () => void;
  onSave?: (data: OCRSaveData) => void | Promise<any>;
  onStartAnalysis?: (analysisRequest: {
    diaryId: number;
    genreIds: number[];
    text: string;
  }) => void;
  selectedDate?: string;
  userKeywords?: { id: number; content: string }[];
}

export interface OCRSaveData {
  userId: number;
  content: string;
  imageUrl: string;
  date: string;
  keywordIds?: number[];
  emotionType?: EmotionType;
  template?: string;
  canvasImage?: string;
  imageBase64?: string;
}

const templates = [
  {
    id: 'blank' as OCRTemplate,
    name: '자유 작성',
    icon: PenTool,
    description: '빈 캔버스에 자유롭게 작성',
    background: 'bg-white',
  },
  {
    id: 'diary' as OCRTemplate,
    name: '그림일기',
    icon: BookOpen,
    description: '위에 그림, 아래 글 영역',
    background: 'bg-gradient-to-b from-blue-50 via-white to-yellow-50',
  },
  {
    id: 'lined' as OCRTemplate,
    name: '줄 노트',
    icon: Notebook,
    description: '가로줄이 있는 노트',
    background: 'bg-white',
  },
];

const getTodayKey = () => new Date().toISOString().slice(0, 10);

export function OCRPreview({
  onBack,
  onSave,
  onStartAnalysis,
  selectedDate = getTodayKey(),
  userKeywords = [],
}: OCRPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<OCRStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileSource, setSelectedFileSource] = useState<'canvas' | 'upload' | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<OCRTemplate>('blank');
  const [canvasImageData, setCanvasImageData] = useState('');
  const [keywords] = useState<string[]>([]);
  const [selectedEmotion] = useState<EmotionType | 'none'>('none');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const realKeywordIds = userKeywords
    .filter((keyword) => keywords.includes(keyword.content))
    .map((keyword) => keyword.id);

  const resetResult = () => {
    setExtractedText('');
    setImageUrl('');
    setFilename('');
    setStatus('idle');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('지원하지 않는 파일 형식입니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setSelectedFile(file);
    setSelectedFileSource('upload');
    setCanvasImageData('');
    resetResult();

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      setPreviewUrl(readerEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setSelectedFileSource(null);
    setPreviewUrl('');
    setCanvasImageData('');
    resetResult();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      toast.error('이미지를 선택해주세요.');
      return;
    }

    if (!AI_BASE_URL) {
      setStatus('error');
      setErrorMessage('AI 서버 주소가 설정되지 않았습니다.');
      setShowErrorDialog(true);
      return;
    }

    setStatus('uploading');

    try {
      const userId = localStorage.getItem('user_id') || '';
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('user_id', userId);

      const response = await axios.post(`${AI_BASE_URL}/ocr/preview`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setExtractedText(response.data.text ?? '');
      setImageUrl(response.data.imageUrl ?? '');
      setFilename(response.data.filename ?? '');
      setStatus('success');
      toast.success('텍스트 추출이 완료되었습니다!');
    } catch (error: any) {
      setStatus('error');
      if (error.response?.status === 403) {
        setErrorMessage('오늘은 이미 사용했습니다. 자정 이후 다시 시도해 주세요.');
      } else if (error.response?.status === 415) {
        setErrorMessage('지원하지 않는 파일 형식입니다.');
      } else {
        setErrorMessage('지금은 처리할 수 없어요. 잠시 후 다시 시도해 주세요.');
      }
      setShowErrorDialog(true);
    }
  };

  const handleCanvasReady = (file: File) => {
    setSelectedFile(file);
    setSelectedFileSource('canvas');
    resetResult();

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const reader = new FileReader();
    reader.onload = (event) => {
      setCanvasImageData(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    toast.success('작성한 손글씨가 준비됐어요. 텍스트 추출을 눌러주세요.');
  };

  const handleSaveAsDiary = async () => {
    const content = extractedText.trim();
    if (!content) {
      toast.error('추출된 텍스트가 없습니다.');
      return;
    }

    setStatus('saving');

    const saveData: OCRSaveData = {
      userId: Number(localStorage.getItem('user_id')),
      content,
      imageUrl,
      date: selectedDate,
      keywordIds: realKeywordIds,
      emotionType: selectedEmotion !== 'none' ? selectedEmotion : undefined,
      template: selectedTemplate,
      canvasImage: canvasImageData,
      imageBase64: canvasImageData || undefined,
    };

    try {
      if (onSave) {
        await onSave(saveData);
        toast.success('저장했어요. 감정 분석을 시작합니다.');
        return;
      }

      const response = await api.post('/api/ocr/results', saveData);
      const diary = response.data;
      const savedDiaryId = diary?.id ?? diary?.diaryId;
      const savedContent = diary?.content ?? content;

      if (!savedDiaryId) {
        throw new Error('저장된 일기 ID를 확인할 수 없습니다.');
      }

      toast.success('저장했어요. 감정 분석을 시작합니다.');
      onStartAnalysis?.({
        diaryId: savedDiaryId,
        genreIds: realKeywordIds,
        text: savedContent,
      });
    } catch (error) {
      console.error('OCR diary save failed:', error);
      setStatus('error');
      setErrorMessage('저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setShowErrorDialog(true);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20 bg-background">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="p-2 text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl text-foreground">손글씨 일기</h1>
        <div className="w-9" />
      </div>

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

      <Tabs defaultValue="write" className="mb-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write">손글씨 작성</TabsTrigger>
          <TabsTrigger value="upload">이미지 업로드</TabsTrigger>
        </TabsList>

        <TabsContent value="write">
          <Card className="bg-card border-border mb-4">
            <CardContent className="p-4">
              <Label className="text-sm mb-3 block text-foreground">템플릿 선택</Label>
              <div className="grid grid-cols-3 gap-2">
                {templates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 mx-auto mb-1 ${
                          selectedTemplate === template.id ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                      <p className="text-xs text-center text-foreground">{template.name}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <HandwritingCanvas template={selectedTemplate} onSave={handleCanvasReady} />

              {selectedFileSource === 'canvas' && selectedFile && status !== 'uploading' && status !== 'success' && (
                <Button onClick={handlePreview} className="w-full mt-3 text-white bg-primary hover:bg-primary/90">
                  <Upload className="w-4 h-4 mr-2" />
                  텍스트 추출
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <Label className="text-sm mb-3 block text-foreground">이미지 업로드</Label>
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
                    <p className="text-sm mb-1 text-foreground">클릭하여 이미지 선택</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, HEIC, WebP (최대 10MB)</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden bg-muted">
                      <img src={previewUrl} alt="Preview" className="w-full h-48 object-contain" />
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-card shadow-md hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm truncate text-foreground">{selectedFile.name}</p>
                      <Button variant="outline" size="sm" onClick={handleUploadClick}>
                        재선택
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <Label className="text-sm mb-3 block text-foreground">추출 텍스트</Label>
                <div className="border border-border rounded-lg p-3 bg-muted/30" style={{ minHeight: '200px' }}>
                  {status === 'uploading' ? (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                      <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
                      <p className="text-sm text-muted-foreground">이미지에서 텍스트를 추출하는 중...</p>
                    </div>
                  ) : extractedText ? (
                    <div className="whitespace-pre-wrap text-sm text-foreground">{extractedText}</div>
                  ) : (
                    <div className="flex items-center justify-center h-full py-12">
                      <p className="text-sm text-center text-muted-foreground">
                        아직 미리보기가 없습니다.
                        <br />
                        이미지를 업로드하고 미리보기를 실행해주세요.
                      </p>
                    </div>
                  )}
                </div>

                {selectedFile && status !== 'uploading' && status !== 'success' && (
                  <Button onClick={handlePreview} className="w-full mt-3 text-white bg-primary hover:bg-primary/90">
                    <Upload className="w-4 h-4 mr-2" />
                    미리보기 실행
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {status === 'success' && (
        <>
          <Card className="bg-card mb-4 border-border">
            <CardContent className="p-4">
              <Label className="text-sm mb-3 block text-foreground">추출된 텍스트</Label>
              <Textarea
                value={extractedText}
                onChange={(event) => setExtractedText(event.target.value)}
                className="min-h-[200px] border-border resize-none bg-background text-foreground"
                placeholder="추출된 텍스트를 편집할 수 있습니다..."
              />
              <div className="flex justify-end mt-2">
                <span className="text-xs text-muted-foreground">{extractedText.length}자</span>
              </div>
            </CardContent>
          </Card>

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

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="border-border">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-foreground">오류 발생</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)} className="w-full text-white bg-accent hover:bg-accent/90">
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
