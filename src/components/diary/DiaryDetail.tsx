import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog';
import { EmotionBadge } from './EmotionBadge';
import { WriteTypeBadge } from './WriteTypeBadge';
import { KeywordChip } from './KeywordChip';
import { Diary, EMOTION_COLORS } from './types';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  Music,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';
import { format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getEmotionCharacterImage, CharacterType, EmotionType as EmotionAPIType } from '../common/characterImages';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface DiaryDetailProps {
  diary: Diary;
  onBack?: () => void;
  onEdit?: (diary: Diary) => void;
  onDelete?: (diaryId: number) => void;
  onReAnalyze?: (diaryId: number) => void;
}

// 감정 한글 → API enum 매핑
const emotionToAPI: Record<string, EmotionAPIType> = {
  '기쁨': 'JOY',
  '슬픔': 'SADNESS',
  '분노': 'ANGER',
  '화남': 'ANGER',
  '무기력': 'APATHY',
  '예민': 'SENSITIVE',
};

export function DiaryDetail({
  diary,
  onBack,
  onEdit,
  onDelete,
  onReAnalyze
}: DiaryDetailProps) {
  const { user } = useAuth();
  const [isReAnalyzing, setIsReAnalyzing] = useState(false);

  // 과거 일기인지 확인 (오늘이 아닌 날짜)
  const isPastDiary = !isSameDay(new Date(diary.date), new Date());

  const handleDelete = () => {
    toast.success('일기가 삭제되었습니다.');
    onDelete?.(diary.id);
  };

  const handleReAnalyze = async () => {
    setIsReAnalyzing(true);
    toast.info('감정 재분석을 시작합니다...');
    
    // Simulate re-analysis
    setTimeout(() => {
      setIsReAnalyzing(false);
      toast.success('감정 분석이 완료되었습니다.');
      onReAnalyze?.(diary.id);
    }, 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'PPP (E)', { locale: ko });
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
          일기 보기
        </h1>
        <div className="w-16" />
      </div>

      {/* Date Header */}
      <Card className="bg-white mb-4" style={{ borderColor: '#E6E0D6' }}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: '#7B8B4F' }} />
              <h2 className="text-lg" style={{ color: '#4A3228' }}>
                {formatDate(diary.date)}
              </h2>
            </div>
            <WriteTypeBadge writeType={diary.writeType} size="md" />
          </div>

          {/* Emotion Analysis Result */}
          {diary.emotionType && diary.analysisStatus === 'COMPLETED' && (
            <>
              <Separator className="my-3" style={{ backgroundColor: '#E6E0D6' }} />
              
              {/* 악기 캐릭터 이미지 */}
              {(() => {
                const characterType = user?.character || 'PIANO';
                const emotionAPI = emotionToAPI[diary.emotionType];
                const characterImage = getEmotionCharacterImage(emotionAPI, characterType);
                const colors = EMOTION_COLORS[diary.emotionType];
                
                return (
                  <div 
                    className="rounded-lg p-6 mb-3 flex flex-col items-center"
                    style={{ backgroundColor: colors.bg }}
                  >
                    {/* Floating character with animation */}
                    {characterImage && (
                      <>
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <ImageWithFallback
                            src={characterImage}
                            alt={`${diary.emotionType} 상태의 악기`}
                            className="w-36 h-36 object-contain"
                          />
                        </motion.div>
                        
                        {/* Elliptical shadow */}
                        <motion.div
                          animate={{ 
                            scale: [1, 0.9, 1],
                            opacity: [0.35, 0.25, 0.35]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-20 h-5 rounded-full mt-2"
                          style={{
                            background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 70%)'
                          }}
                        />
                      </>
                    )}
                  </div>
                );
              })()}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">감정 분석 결과</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReAnalyze}
                    disabled={isReAnalyzing}
                    className="text-xs gap-1 h-auto py-1"
                    style={{ color: '#7B8B4F' }}
                  >
                    {isReAnalyzing ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        분석 중...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        다시 분석
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <EmotionBadge 
                    emotion={diary.emotionType} 
                    size="lg"
                    score={diary.emotionScore}
                    showScore={true}
                  />
                  {diary.emotionScore !== undefined && (
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${diary.emotionScore}%`,
                            backgroundColor: EMOTION_COLORS[diary.emotionType].text
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Analysis Status */}
          {diary.analysisStatus && diary.analysisStatus !== 'COMPLETED' && (
            <>
              <Separator className="my-3" style={{ backgroundColor: '#E6E0D6' }} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {diary.analysisStatus === 'PENDING' && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <p className="text-sm text-gray-500">감정 분석 대기 중...</p>
                    </>
                  )}
                  {diary.analysisStatus === 'IN_PROGRESS' && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#7B8B4F' }} />
                      <p className="text-sm" style={{ color: '#7B8B4F' }}>
                        감정 분석 진행 중...
                      </p>
                    </>
                  )}
                  {diary.analysisStatus === 'FAILED' && (
                    <>
                      <p className="text-sm text-red-500">감정 분석 실패</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReAnalyze}
                        className="text-xs"
                        style={{ color: '#7B8B4F' }}
                      >
                        재분석
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      <Card className="bg-white mb-4" style={{ borderColor: '#E6E0D6' }}>
        <CardContent className="p-5 space-y-4">
          {/* Handwriting Canvas Image */}
          {diary.writeType === 'HANDWRITING' && diary.canvasImage && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4" style={{ color: '#7B8B4F' }} />
                <p className="text-sm" style={{ color: '#4A3228' }}>손글씨</p>
              </div>
              <img
                src={diary.canvasImage}
                alt="Handwriting Canvas"
                className="w-full rounded-lg border"
                style={{ borderColor: '#E6E0D6' }}
              />
              <Separator className="my-4" style={{ backgroundColor: '#E6E0D6' }} />
            </div>
          )}

          {/* OCR Image (Uploaded) */}
          {diary.writeType === 'HANDWRITING' && diary.imageUrl && !diary.canvasImage && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4" style={{ color: '#7B8B4F' }} />
                <p className="text-sm" style={{ color: '#4A3228' }}>손글씨 원본</p>
              </div>
              <img
                src={diary.imageUrl}
                alt="Handwriting"
                className="w-full rounded-lg border"
                style={{ borderColor: '#E6E0D6' }}
              />
              <Separator className="my-4" style={{ backgroundColor: '#E6E0D6' }} />
            </div>
          )}

          {/* Text Content */}
          <div>
            <p
              className="text-base leading-relaxed whitespace-pre-wrap"
              style={{ color: '#4A3228', lineHeight: '1.8' }}
            >
              {diary.content}
            </p>
          </div>

          {/* Keywords */}
          {diary.keywords.length > 0 && (
            <>
              <Separator style={{ backgroundColor: '#E6E0D6' }} />
              <div>
                <p className="text-sm mb-2" style={{ color: '#4A3228' }}>
                  키워드
                </p>
                <div className="flex flex-wrap gap-2">
                  {diary.keywords.map((keyword, idx) => (
                    <KeywordChip key={idx} keyword={keyword} emotion={diary.emotionType} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator style={{ backgroundColor: '#E6E0D6' }} />
          <div className="flex items-center justify-between text-xs text-gray-500">
            {diary.createdAt && (
              <p>작성: {format(new Date(diary.createdAt), 'PPp', { locale: ko })}</p>
            )}
            {diary.updatedAt && diary.updatedAt !== diary.createdAt && (
              <p>수정: {format(new Date(diary.updatedAt), 'PPp', { locale: ko })}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Music Recommendation - 모든 일기에 표시 */}
      {diary.emotionType && diary.analysisStatus === 'COMPLETED' && (
        <Card className="bg-white mb-4" style={{ borderColor: '#E6E0D6' }}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-5 h-5" style={{ color: '#7B8B4F' }} />
              <h3 className="text-base" style={{ color: '#4A3228' }}>오늘의 추천 음악</h3>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F1E8' }}>
              <p className="text-sm mb-1" style={{ color: '#4A3228' }}>
                <strong>Reflections</strong> - Ludovico Einaudi
              </p>
              <p className="text-xs text-gray-500">
                당신의 {diary.emotionType} 감정에 어울리는 음악입니다
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenge - 오늘 일기만 표시 */}
      {!isPastDiary && diary.emotionType && diary.analysisStatus === 'COMPLETED' && (
        <Card className="bg-white mb-4" style={{ borderColor: '#E6E0D6' }}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5" style={{ color: '#7B8B4F' }} />
              <h3 className="text-base" style={{ color: '#4A3228' }}>오늘의 챌린지</h3>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F1E8' }}>
              <p className="text-sm mb-2" style={{ color: '#4A3228' }}>
                <strong>감사 일기 쓰기</strong>
              </p>
              <p className="text-xs text-gray-500 mb-3">
                오늘 하루 중 감사했던 일 3가지를 떠올려보세요
              </p>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#7B8B4F' }}>
                <span>리워드: 50 LP</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => onEdit?.(diary)}
          variant="outline"
          className="flex-1"
          style={{ borderColor: '#7B8B4F', color: '#7B8B4F' }}
        >
          <Edit className="w-4 h-4 mr-2" />
          수정
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>일기를 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                이 작업은 되돌릴 수 없습니다. 일기와 관련된 모든 데이터가 영구적으로 삭제됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                삭제하기
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Info Card */}
      <Card className="mt-4 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          {isPastDiary ? (
            <p className="text-sm text-blue-800">
              💡 과거 일기는 감정 분석과 음악 추천만 제공됩니다. 챌린지와 LP 획득은 오늘 일기 작성 시에만 가능합니다.
            </p>
          ) : (
            <p className="text-sm text-blue-800">
              💡 일기를 수정하거나 '다시 분석'을 클릭하면 감정 재분석이 진행됩니다.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}