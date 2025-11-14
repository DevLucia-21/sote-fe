import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { OCRPreview } from './OCRPreview';
import { STTTranscribe } from './STTTranscribe';
import { AnalysisLoading } from '../analysis/AnalysisLoading';
import { PenTool, Mic } from 'lucide-react';

type ViewMode = 'menu' | 'ocr' | 'stt' | 'analysis';

export function OCRSTTDemo() {
  const [viewMode, setViewMode] = useState<ViewMode>('menu');

  if (viewMode === 'analysis') {
    return (
      <AnalysisLoading
        onComplete={() => setViewMode('menu')}
        onRetry={() => setViewMode('menu')}
      />
    );
  }

  if (viewMode === 'ocr') {
    return (
      <OCRPreview
        onBack={() => setViewMode('menu')}
        onSave={(data) => {
          console.log('OCR 저장:', data);
        }}
        onStartAnalysis={() => setViewMode('analysis')}
      />
    );
  }

  if (viewMode === 'stt') {
    return (
      <STTTranscribe
        onBack={() => setViewMode('menu')}
        onSave={(data) => {
          console.log('STT 저장:', data);
        }}
        onStartAnalysis={() => setViewMode('analysis')}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20 bg-background">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl mb-2 text-center text-foreground">
          일기 작성 방식 선택
        </h1>
        <p className="text-sm mb-6 text-center text-muted-foreground">
          손글씨(OCR) 또는 음성(STT)으로 일기를 작성하세요
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="bg-card cursor-pointer hover:shadow-lg transition-shadow border-border"
            onClick={() => setViewMode('ocr')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#F0F7E6' }}
                >
                  <PenTool className="w-8 h-8" style={{ color: '#7B8B4F' }} />
                </div>
                <h3 className="text-lg mb-2 text-foreground">
                  손글씨 일기
                </h3>
                <p className="text-sm text-muted-foreground">
                  직접 손글씨를 작성하거나 이미지를 업로드하여 텍스트를 추출합니다
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-card cursor-pointer hover:shadow-lg transition-shadow border-border"
            onClick={() => setViewMode('stt')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#F0F7E6' }}
                >
                  <Mic className="w-8 h-8" style={{ color: '#7B8B4F' }} />
                </div>
                <h3 className="text-lg mb-2 text-foreground">
                  음성 일기
                </h3>
                <p className="text-sm text-muted-foreground">
                  녹음하거나 음성 파일을 업로드하여 텍스트로 변환합니다
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
