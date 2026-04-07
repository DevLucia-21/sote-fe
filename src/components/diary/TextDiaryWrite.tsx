import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TextDiaryWriteProps {
  onBack: () => void;
  onSave?: (diary: { content: string }) => void | Promise<void>;
  initialContent?: string;
  isEditMode?: boolean;
  initialWriteType?: string;
}

export function TextDiaryWrite({ onBack, onSave, initialContent = '', isEditMode = false }: TextDiaryWriteProps) {
  const [content, setContent] = useState<string>(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showMinLengthDialog, setShowMinLengthDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const MINIMUM_LENGTH = 10;

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('일기 내용을 입력해주세요.');
      return;
    }

    if (content.trim().length < MINIMUM_LENGTH) {
      setShowMinLengthDialog(true);
      return;
    }

    setIsSaving(true);

    try {
      if (onSave) {
        await onSave({ content: content.trim() });
      }
    } catch (error) {
      setIsSaving(false);
      setErrorMessage('저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setShowErrorDialog(true);
    }
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
          {isEditMode ? '일기 수정' : '일기 작성'}
        </h1>
        <div className="w-9" />
      </div>

      {/* 일기 내용 */}
      <Card className="bg-card mb-6 border-border">
        <CardContent className="p-4">
          <Label className="text-sm mb-3 block text-foreground">
            일기 내용
          </Label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] border-border resize-none bg-background text-foreground"
            placeholder="오늘 하루는 어땠나요? 자유롭게 작성해보세요..."
            autoFocus
          />
          <div className="flex justify-end mt-2">
            <span className="text-xs text-muted-foreground">
              {content.length}자
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
        >
          취소
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 text-white bg-accent hover:bg-accent/90"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            isEditMode ? '수정하기' : '저장하기'
          )}
        </Button>
      </div>

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

      {/* 최소 글자 수 미달 다이얼로그 */}
      <Dialog open={showMinLengthDialog} onOpenChange={setShowMinLengthDialog}>
        <DialogContent className="border-border">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-50 dark:bg-yellow-950/20">
                <AlertCircle className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-foreground">
              내용을 더 작성해주세요
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              일기 내용이 너무 짧습니다.<br />
              최소 {MINIMUM_LENGTH}자 이상 작성해주세요.<br />
              <span className="text-primary">(현재 {content.trim().length}자)</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowMinLengthDialog(false)}
              className="w-full text-white bg-primary hover:bg-primary/90"
            >
              계속 작성하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
