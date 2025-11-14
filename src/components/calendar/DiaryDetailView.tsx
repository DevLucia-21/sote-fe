import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, Mic, Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { DiaryEntry } from './types';
import { emotionColors, getEmotionLabel } from './noteMapping';
import { EmotionCard } from '../analysis/EmotionCard';
import { MusicCard } from '../analysis/MusicCard';
import { ChallengeCard } from '../analysis/ChallengeCard';
import { AnalysisResult as AnalysisResultType } from '../analysis/types';
import { CharacterType } from '../common/characterImages';

interface DiaryDetailViewProps {
  diary: DiaryEntry;
  onBack: () => void;
  onEdit?: () => void;
  isEasyMode?: boolean;
  characterType?: CharacterType;
}

// Mock data for music and challenge recommendations
function getMockAnalysisData(diary: DiaryEntry): AnalysisResultType {
  const emotionLabel = getEmotionLabel(diary.emotion);
  
  // 일기 내용 기반 감정 분석 이유 (날짜별)
  const emotionReasonsByDate: Record<string, string> = {
    '2025-10-02': '기쁨의 감정을 직접 표현하셨네요.',
    '2025-10-03': '좋은 소식과 친구와의 즐거운 시간에서 기쁨이 느껴져요.',
    '2025-10-05': '여러 일들이 겹쳐 힘들었던 감정이 느껴져요.',
    '2025-10-06': '미팅 실수와 추가 업무로 속상했던 마음이 전해져요.',
    '2025-10-09': '무기력한 상태를 짧게 표현하셨네요.',
    '2025-10-10': '아무것도 하고 싶지 않았던 에너지 없는 하루였어요.',
    '2025-10-13': '작은 일에도 신경 쓰이고 친구 말에 상처받은 예민한 하루였어요.',
    '2025-10-14': '소음, 시선 등 평소 괜찮던 것들이 불편하게 느껴진 예민한 감정이 드러나요.',
    '2025-10-17': '화난 감정을 짧고 강하게 표현하셨어요.',
    '2025-10-18': '억울한 일로 인한 분노가 하루 종일 이어졌네요.',
    '2025-10-21': '친구와의 대화, 산책 등 긍정적인 경험들이 가득했어요.',
    '2025-10-25': '특별한 이유 없이 찾아온 슬픔을 솔직하게 담으셨네요.',
    '2025-11-10': '새로운 시작에 대한 설렘과 행복한 하루의 순간들이 가득했어요.',
  };
  
  // Mock music recommendations based on emotion
  const musicRecommendations: Record<string, any> = {
    기쁨: {
      title: 'Happy',
      artist: 'Pharrell Williams',
      album: 'G I R L',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      spotifyUrl: '#',
      reason: '밝고 경쾌한 멜로디가 기쁜 감정을 더욱 고조시켜줄 거예요.',
    },
    슬픔: {
      title: 'Someone Like You',
      artist: 'Adele',
      album: '21',
      coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
      spotifyUrl: '#',
      reason: '따뜻한 위로가 되어줄 감성적인 멜로디예요.',
    },
    분노: {
      title: 'Lose Yourself',
      artist: 'Eminem',
      album: '8 Mile',
      coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
      spotifyUrl: '#',
      reason: '강렬한 비트로 분노를 에너지로 전환시켜줘요.',
    },
    무기력: {
      title: 'Weightless',
      artist: 'Marconi Union',
      album: 'Weightless',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
      spotifyUrl: '#',
      reason: '평온한 사운드가 마음의 안정을 찾아줄 거예요.',
    },
    예민: {
      title: 'Clair de Lune',
      artist: 'Claude Debussy',
      album: 'Suite Bergamasque',
      coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      spotifyUrl: '#',
      reason: '부드러운 피아노 선율이 예민한 감정을 진정시켜줘요.',
    },
  };

  // Mock challenge recommendations based on emotion
  const challengeRecommendations: Record<string, any> = {
    기쁨: {
      title: '행복 일기 3줄 쓰기',
      description: '오늘의 기쁜 순간을 3줄로 정리해보세요',
      icon: '✨',
      difficulty: 'easy',
      duration: '5분',
    },
    슬픔: {
      title: '감정 표현하기',
      description: '마음속 감정을 글이나 그림으로 표현해보세요',
      icon: '🎨',
      difficulty: 'medium',
      duration: '10분',
    },
    분노: {
      title: '심호흡 명상',
      description: '5분간 깊은 호흡으로 마음을 진정시켜보세요',
      icon: '🧘',
      difficulty: 'easy',
      duration: '5분',
    },
    무기력: {
      title: '가벼운 산책',
      description: '10분만 밖에 나가서 걸어보세요',
      icon: '🚶',
      difficulty: 'easy',
      duration: '10분',
    },
    예민: {
      title: '감사 일기',
      description: '오늘 감사한 일 3가지를 적어보세요',
      icon: '🙏',
      difficulty: 'easy',
      duration: '5분',
    },
  };

  // 날짜별 맞춤 이유 또는 기본 감정별 이유
  const defaultReasons: Record<string, string> = {
    기쁨: '긍정적인 표현이 많고 에너지 넘치는 단어를 사용했어요.',
    슬픔: '회상과 그리움의 단어들이 많이 보였어요.',
    분노: '강렬하고 단호한 표현들이 분노의 감정을 보여주고 있어요.',
    무기력: '피곤함과 지침을 나타내는 표현들이 많았어요.',
    예민: '세심하고 민감한 표현들이 눈에 띄었어요.',
  };

  return {
    date: diary.date,
    emotion: emotionLabel as any,
    confidence: Math.round(diary.score * 20),
    reason: emotionReasonsByDate[diary.date] || defaultReasons[emotionLabel] || `${emotionLabel}의 감정이 느껴지는 글이었어요.`,
    description: `오늘 하루 ${emotionLabel}이 느껴지는 날이었네요.`,
    music: musicRecommendations[emotionLabel] || musicRecommendations['기쁨'],
    challenge: challengeRecommendations[emotionLabel] || challengeRecommendations['기쁨'],
  };
}

export function DiaryDetailView({ diary, onBack, onEdit, isEasyMode, characterType }: DiaryDetailViewProps) {
  const emotionLabel = getEmotionLabel(diary.emotion);
  const color = emotionColors[diary.emotion];
  const analysisData = getMockAnalysisData(diary);
  
  // 작성 일자와 일기 날짜가 같은 날인지 확인 (챌린지 표시 여부)
  const wasWrittenOnSameDay = diary.createdAt 
    ? diary.createdAt.split('T')[0] === diary.date 
    : true; // createdAt이 없으면 챌린지 표시 (기존 데이터)
  
  const getWriteTypeIcon = () => {
    switch (diary.writeType) {
      case 'TEXT':
        return <FileText className="w-4 h-4" />;
      case 'VOICE':
        return <Mic className="w-4 h-4" />;
      case 'HANDWRITING':
        return <Pencil className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getWriteTypeLabel = () => {
    switch (diary.writeType) {
      case 'TEXT':
        return '텍스트';
      case 'VOICE':
        return '음성';
      case 'HANDWRITING':
        return '손글씨';
      default:
        return '텍스트';
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(diary);
    }
  };
  
  return (
    <div className="fixed inset-x-0 top-0 bottom-0 bg-background z-40 overflow-y-auto pb-24">
      {/* Header */}
      <div className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center">
          <Button variant="ghost" onClick={onBack} className="text-foreground -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="flex-1 text-center text-foreground">
            일기 상세
          </h2>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Date */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <p className="text-primary">
            {new Date(diary.date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Card 1: Diary Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden border-border shadow-lg p-6 bg-card">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-foreground">
                  {new Date(diary.date).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                  })} 일기
                </h3>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-xs text-foreground">
                  {getWriteTypeIcon()}
                  <span>{getWriteTypeLabel()}</span>
                </div>
              </div>
              
              {/* Keywords - 이지모드에서 제거 */}
              {!isEasyMode && diary.keywords && diary.keywords.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm mb-2 text-primary">키워드</p>
                  <div className="flex flex-wrap gap-2">
                    {diary.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: color + '15',
                          color: color,
                        }}
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diary Content */}
              {diary.content && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-primary">작성 내용</p>
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEdit}
                        className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        재작성
                      </Button>
                    )}
                  </div>
                  <div className="p-4 rounded-xl leading-relaxed text-sm bg-secondary text-foreground">
                    {diary.content}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Card 2: Emotion Summary */}
          <EmotionCard
            emotion={analysisData.emotion}
            confidence={analysisData.confidence}
            reason={analysisData.reason}
            description={analysisData.description}
            instrument="piano"
            characterType={characterType}
          />

          {/* Card 3: Music Recommendation - 이지모드에서 제거 */}
          {!isEasyMode && (
            <MusicCard
              music={analysisData.music}
              emotion={analysisData.emotion}
              detailView={true}
            />
          )}

          {/* Card 4: Challenge - 당일 작성한 일기만 표시, 이지모드에서 제거 */}
          {!isEasyMode && wasWrittenOnSameDay && (
            <ChallengeCard
              challenge={analysisData.challenge}
              emotion={analysisData.emotion}
              detailView={true}
            />
          )}
        </div>

        {/* Bottom Spacing */}
        <div className="h-12" />
      </div>
    </div>
  );
}