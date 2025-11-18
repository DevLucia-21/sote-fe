import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DiaryManager } from './DiaryManager';
import { DiaryCard } from './DiaryCard';
import { EmotionBadge } from './EmotionBadge';
import { WriteTypeBadge } from './WriteTypeBadge';
import { KeywordChip } from './KeywordChip';
import { mockDiaries, mockKeywords } from './mockData';
import { EmotionType, WriteType } from './types';
import { ArrowLeft } from 'lucide-react';

interface DiaryDemoProps {
  onBack?: () => void;
}

export function DiaryDemo({ onBack }: DiaryDemoProps) {
  const [showFullApp, setShowFullApp] = useState(false);

  if (showFullApp) {
    return <DiaryManager onBack={() => setShowFullApp(false)} />;
  }

  const emotions: EmotionType[] = ['기쁨', '슬픔', '분노', '화남', '예민', '무기력'];
  const writeTypes: WriteType[] = ['TEXT', 'STT', 'OCR'];

  return (
    <div className="min-h-screen p-4 pb-20" style={{ backgroundColor: '#F5F1E8' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="-ml-2 gap-1">
          <ArrowLeft className="w-4 h-4" />
          뒤로
        </Button>
        <h1 className="text-xl" style={{ color: '#4A3228' }}>
          다이어리 시스템 데모
        </h1>
        <div className="w-16" />
      </div>

      {/* Launch Full App */}
      <Card className="bg-white mb-4" style={{ borderColor: '#E6E0D6' }}>
        <CardHeader>
          <CardTitle style={{ color: '#4A3228' }}>완전한 다이어리 앱</CardTitle>
          <CardDescription>
            모든 기능이 포함된 다이어리 시스템을 체험해보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowFullApp(true)}
            className="w-full text-white"
            style={{ backgroundColor: '#7B8B4F' }}
          >
            다이어리 앱 시작하기
          </Button>
        </CardContent>
      </Card>

      {/* Component Showcase */}
      <Tabs defaultValue="badges" className="space-y-4">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="badges">배지</TabsTrigger>
          <TabsTrigger value="chips">칩</TabsTrigger>
          <TabsTrigger value="cards">카드</TabsTrigger>
        </TabsList>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-4">
          <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: '#4A3228' }}>
                감정 배지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Small</p>
                  <div className="flex flex-wrap gap-2">
                    {emotions.map(emotion => (
                      <EmotionBadge key={emotion} emotion={emotion} size="sm" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Medium</p>
                  <div className="flex flex-wrap gap-2">
                    {emotions.map(emotion => (
                      <EmotionBadge key={emotion} emotion={emotion} size="md" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Large</p>
                  <div className="flex flex-wrap gap-2">
                    {emotions.map(emotion => (
                      <EmotionBadge key={emotion} emotion={emotion} size="lg" />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: '#4A3228' }}>
                작성 타입 배지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Small</p>
                  <div className="flex flex-wrap gap-2">
                    {writeTypes.map(type => (
                      <WriteTypeBadge key={type} writeType={type} size="sm" />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Medium</p>
                  <div className="flex flex-wrap gap-2">
                    {writeTypes.map(type => (
                      <WriteTypeBadge key={type} writeType={type} size="md" />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chips Tab */}
        <TabsContent value="chips" className="space-y-4">
          <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: '#4A3228' }}>
                읽기 전용 칩
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mockKeywords.slice(0, 5).map(keyword => (
                  <KeywordChip key={keyword.id} keyword={keyword.content} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: '#4A3228' }}>
                토글 칩 (필터용)
              </CardTitle>
              <CardDescription>클릭하여 선택/해제</CardDescription>
            </CardHeader>
            <CardContent>
              <ToggleChipsDemo />
            </CardContent>
          </Card>

          <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: '#4A3228' }}>
                삭제 가능 칩
              </CardTitle>
              <CardDescription>클릭하여 삭제</CardDescription>
            </CardHeader>
            <CardContent>
              <RemovableChipsDemo />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-4">
          <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: '#4A3228' }}>
                일반 카드
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockDiaries.slice(0, 2).map(diary => (
                <DiaryCard
                  key={diary.id}
                  diary={diary}
                  onClick={() => alert(`일기 #${diary.id} 클릭됨`)}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white" style={{ borderColor: '#E6E0D6' }}>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: '#4A3228' }}>
                컴팩트 카드
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockDiaries.slice(0, 2).map(diary => (
                <DiaryCard
                  key={diary.id}
                  diary={diary}
                  onClick={() => alert(`일기 #${diary.id} 클릭됨`)}
                  compact
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info */}
      <Card className="mt-4 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            💡 위 '다이어리 앱 시작하기' 버튼을 눌러 전체 기능을 체험해보세요!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for toggle chips demo
function ToggleChipsDemo() {
  const [selected, setSelected] = useState<number[]>([]);

  const toggleKeyword = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(k => k !== id));
    } else {
      if (selected.length >= 3) {
        alert('최대 3개까지만 선택 가능합니다');
        return;
      }
      setSelected([...selected, id]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {mockKeywords.map(keyword => (
          <KeywordChip
            key={keyword.id}
            keyword={keyword.content}
            selected={selected.includes(keyword.id)}
            onToggle={() => toggleKeyword(keyword.id)}
            disabled={!selected.includes(keyword.id) && selected.length >= 3}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">선택됨: {selected.length}/3</p>
    </div>
  );
}

// Helper component for removable chips demo
function RemovableChipsDemo() {
  const [keywords, setKeywords] = useState(mockKeywords.slice(0, 5));

  const removeKeyword = (id: number) => {
    setKeywords(keywords.filter(k => k.id !== id));
  };

  return (
    <div>
      {keywords.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {keywords.map(keyword => (
            <KeywordChip
              key={keyword.id}
              keyword={keyword.content}
              onRemove={() => removeKeyword(keyword.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          모든 키워드가 삭제되었습니다
        </p>
      )}
    </div>
  );
}
