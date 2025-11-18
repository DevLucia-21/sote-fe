import { EmotionType, EmotionStyle, MusicRecommendation, ChallengeRecommendation } from './types';

// Emotion styling based on emotion type
export const emotionStyles: Record<EmotionType, EmotionStyle> = {
  기쁨: {
    backgroundColor: '#FFF3C4',
    accentColor: '#F5C842',
    textColor: '#4A3228',
    characterMood: 'happy',
  },
  슬픔: {
    backgroundColor: '#CDE3F8',
    accentColor: '#5B94CC',
    textColor: '#2C4A66',
    characterMood: 'sad',
  },
  분노: {
    backgroundColor: '#F8C4C4',
    accentColor: '#E04B4B',
    textColor: '#5D2828',
    characterMood: 'angry',
  },
  화남: {
    backgroundColor: '#F8C4C4',
    accentColor: '#E04B4B',
    textColor: '#5D2828',
    characterMood: 'angry',
  },
  무기력: {
    backgroundColor: '#E6E6E6',
    accentColor: '#8A8A8A',
    textColor: '#4A4A4A',
    characterMood: 'tired',
  },
  예민: {
    backgroundColor: '#E7D5F8',
    accentColor: '#9B76CC',
    textColor: '#4A2866',
    characterMood: 'sensitive',
  },
};

// Sample music recommendations by emotion
export const musicRecommendations: Record<EmotionType, MusicRecommendation[]> = {
  기쁨: [
    {
      title: 'Sunrise',
      artist: 'The Harmonies',
      genre: 'Indie Pop',
      reason: '밝은 리듬과 경쾌한 코드가 오늘의 긍정적인 감정과 잘 어울려요.',
    },
    {
      title: 'Happy Days',
      artist: 'Joy Ensemble',
      genre: 'Pop',
      reason: '활기찬 멜로디가 당신의 기쁨을 더욱 빛나게 해줄 거예요.',
    },
  ],
  슬픔: [
    {
      title: 'Moonlight Sonata',
      artist: 'Piano Collective',
      genre: 'Classical',
      reason: '잔잔한 피아노 선율이 슬픔을 위로하고 정화시켜줄 거예요.',
    },
    {
      title: 'Rainy Day',
      artist: 'Melancholy Strings',
      genre: 'Acoustic',
      reason: '부드러운 선율이 당신의 감정에 공감하고 함께합니다.',
    },
  ],
  분노: [
    {
      title: 'Release',
      artist: 'Thunder Beats',
      genre: 'Rock',
      reason: '강렬한 비트와 에너지로 감정을 건강하게 표출할 수 있어요.',
    },
    {
      title: 'Storm',
      artist: 'Electric Souls',
      genre: 'Alternative Rock',
      reason: '격렬한 사운드가 분노를 승화시키는 데 도움을 줄 거예요.',
    },
  ],
  화남: [
    {
      title: 'Release',
      artist: 'Thunder Beats',
      genre: 'Rock',
      reason: '강렬한 비트와 에너지로 감정을 건강하게 표출할 수 있어요.',
    },
    {
      title: 'Storm',
      artist: 'Electric Souls',
      genre: 'Alternative Rock',
      reason: '격렬한 사운드가 분노를 승화시키는 데 도움을 줄 거예요.',
    },
  ],
  무기력: [
    {
      title: 'Gentle Wake',
      artist: 'Calm Waters',
      genre: 'Ambient',
      reason: '차분한 사운드스케이프가 천천히 에너지를 회복시켜줄 거예요.',
    },
    {
      title: 'Morning Light',
      artist: 'Serene Sounds',
      genre: 'Chillout',
      reason: '평온한 리듬이 무기력함에서 벗어나도록 도와줍니다.',
    },
  ],
  예민: [
    {
      title: 'Soft Whispers',
      artist: 'Quiet Mind',
      genre: 'Lo-fi',
      reason: '부드럽고 반복적인 패턴이 예민한 감각을 진정시켜줘요.',
    },
    {
      title: 'Inner Peace',
      artist: 'Meditation Ensemble',
      genre: 'New Age',
      reason: '조화로운 음색이 마음의 균형을 찾도록 도와줍니다.',
    },
  ],
};

// Sample challenges by emotion
export const challengeRecommendations: Record<EmotionType, ChallengeRecommendation[]> = {
  기쁨: [
    {
      id: 'joy-1',
      category: '일기',
      title: '감사한 일 세 가지 적기',
      description: '기쁨의 감정을 더 확장하려면 감사한 순간을 기록해보세요.',
      emotion: '기쁨',
    },
    {
      id: 'joy-2',
      category: '소통',
      title: '행복을 나누기',
      description: '주변 사람에게 긍정적인 메시지를 전해보세요.',
      emotion: '기쁨',
    },
  ],
  슬픔: [
    {
      id: 'sad-1',
      category: '일기',
      title: '감정 일기 쓰기',
      description: '슬픔의 원인을 천천히 되돌아보며 감정을 정리해보세요.',
      emotion: '슬픔',
    },
    {
      id: 'sad-2',
      category: '휴식',
      title: '위로의 음악 듣기',
      description: '30분간 좋아하는 음악을 들으며 감정을 환기해보세요.',
      emotion: '슬픔',
    },
  ],
  분노: [
    {
      id: 'anger-1',
      category: '명상',
      title: '심호흡 명상',
      description: '5분간 깊은 호흡으로 감정을 차분하게 가라앉혀보세요.',
      emotion: '분노',
    },
    {
      id: 'anger-2',
      category: '운동',
      title: '신체 활동하기',
      description: '산책이나 운동으로 분노를 건강하게 해소해보세요.',
      emotion: '분노',
    },
  ],
  화남: [
    {
      id: 'anger-1',
      category: '명상',
      title: '심호흡 명상',
      description: '5분간 깊은 호흡으로 감정을 차분하게 가라앉혀보세요.',
      emotion: '분노',
    },
    {
      id: 'anger-2',
      category: '운동',
      title: '신체 활동하기',
      description: '산책이나 운동으로 분노를 건강하게 해소해보세요.',
      emotion: '분노',
    },
  ],
  무기력: [
    {
      id: 'lethargy-1',
      category: '목표',
      title: '작은 목표 세우기',
      description: '오늘 할 수 있는 작은 일 하나를 정하고 실천해보세요.',
      emotion: '무기력',
    },
    {
      id: 'lethargy-2',
      category: '운동',
      title: '햇빛 쬐기',
      description: '10분간 밖에 나가 햇빛을 받으며 걸어보세요.',
      emotion: '무기력',
    },
  ],
  예민: [
    {
      id: 'sensitive-1',
      category: '휴식',
      title: '디지털 디톡스',
      description: '1시간 동안 스마트폰을 내려놓고 조용한 시간을 가져보세요.',
      emotion: '예민',
    },
    {
      id: 'sensitive-2',
      category: '휴식',
      title: '감각 줄이기',
      description: '조명을 낮추고 조용한 공간에서 휴식을 취해보세요.',
      emotion: '예민',
    },
  ],
};

// Loading messages
export const loadingMessages = [
  '오늘 하루의 리듬을 찾는 중이에요.',
  '감정의 파동을 읽고 있어요…',
  '당신의 이야기를 음악으로 번역하고 있어요.',
  '감정의 색깔을 찾고 있어요…',
  '마음의 멜로디를 듣고 있어요.',
];

// Emotion reasons by emotion type - 일기 내용 기반
export const emotionReasons: Record<EmotionType, string[]> = {
  기쁨: [
    '기쁨의 감정을 직접 표현하셨네요.',
    '좋은 소식과 친구와의 즐거운 시간에서 기쁨이 느껴져요.',
    '친구와의 대화, 산책 등 긍정적인 경험들이 가득했어요.',
  ],
  슬픔: [
    '여러 일들이 겹쳐 힘들었던 감정이 느껴져요.',
    '하루 종일 이어진 우울한 감정과 슬픔을 표현하셨어요.',
    '미팅 실수와 추가 업무로 속상했던 마음이 전해져요.',
    '특별한 이유 없이 찾아온 슬픔을 솔직하게 담으셨네요.',
  ],
  분노: [
    '화난 감정을 짧고 강하게 표현하셨어요.',
    '억울한 일로 인한 분노가 하루 종일 이어졌네요.',
  ],
  화남: [
    '화난 감정을 짧고 강하게 표현하셨어요.',
    '억울한 일로 인한 분노가 하루 종일 이어졌네요.',
  ],
  무기력: [
    '무기력한 상태를 짧게 표현하셨네요.',
    '아무것도 하고 싶지 않았던 에너지 없는 하루였어요.',
  ],
  예민: [
    '작은 일에도 신경 쓰이고 친구 말에 상처받은 예민한 하루였어요.',
    '소음, 시선 등 평소 괜찮던 것들이 불편하게 느껴진 예민한 감정이 드러나요.',
  ],
};

export const emotionDescriptions: Record<EmotionType, string> = {
  기쁨: '당신의 하루는 기쁨의 멜로디로 채워져 있었어요.',
  슬픔: '당신의 하루는 잔잔한 슬픔의 선율을 담고 있어요.',
  분노: '당신의 하루는 강렬한 감정의 리듬을 품고 있어요.',
  화남: '당신의 하루는 강렬한 감정의 리듬을 품고 있어요.',
  무기력: '당신의 하루는 조용히 쉬어가는 휴지부 같아요.',
  예민: '당신의 하루는 섬세한 감각의 화음을 담고 있어요.',
};