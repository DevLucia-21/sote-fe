import { LPMusic } from './types';

// Mock 데이터 - 2025년 10월 일기 데이터와 통일
export const mockWeeklyLP: LPMusic[] = [
  {
    id: '1',
    title: 'Happy',
    artist: 'Pharrell Williams',
    album: 'G I R L',
    albumImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    playUrl: 'https://open.spotify.com/track/example1',
    rewardDate: '2025-10-25',
    recommendedAt: '2025-10-25T22:30:00Z',
    genre: 'Soul',
    emotionLabel: '슬픔',
    reason: '특별한 이유 없이 슬픔이 밀려왔던 당신에게, 따뜻한 위로를 전하는 곡이에요.',
  },
  {
    id: '2',
    title: 'Someone Like You',
    artist: 'Adele',
    album: '21',
    albumImageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
    playUrl: 'https://open.spotify.com/track/example2',
    rewardDate: '2025-10-21',
    recommendedAt: '2025-10-21T16:00:00Z',
    genre: 'Pop',
    emotionLabel: '기쁨',
    reason: '친구와 즐거운 대화를 나누고 여유로운 산책을 한 오늘을 기념하는 멜로디예요.',
  },
  {
    id: '3',
    title: 'Weightless',
    artist: 'Marconi Union',
    album: 'Weightless',
    albumImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    playUrl: 'https://open.spotify.com/track/example3',
    rewardDate: '2025-10-18',
    recommendedAt: '2025-10-18T20:45:00Z',
    genre: 'Rock',
    emotionLabel: '분노',
    reason: '억울한 일로 화가 났던 당신의 마음을 차분하게 다독여줄 거예요.',
  },
];

export const mockMonthlyLP: LPMusic[] = [
  {
    id: '4',
    title: 'Lose Yourself',
    artist: 'Eminem',
    album: '8 Mile',
    albumImageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
    playUrl: 'https://open.spotify.com/track/example4',
    rewardDate: '2025-10-17',
    recommendedAt: '2025-10-17T17:20:00Z',
    genre: 'Hip-Hop',
    emotionLabel: '분노',
    reason: '화가 났던 당신의 감정을 강렬한 비트로 에너지로 바꿔줄 거예요.',
  },
  {
    id: '5',
    title: 'Clair de Lune',
    artist: 'Claude Debussy',
    album: 'Suite Bergamasque',
    albumImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    playUrl: 'https://open.spotify.com/track/example5',
    rewardDate: '2025-10-14',
    recommendedAt: '2025-10-14T18:30:00Z',
    genre: 'Classical',
    emotionLabel: '예민',
    reason: '작은 소음에도 짜증이 났던 당신에게 부드러운 피아노 선율로 평온함을 선물해요.',
  },
  {
    id: '6',
    title: 'Lovely',
    artist: 'Billie Eilish',
    album: 'Single',
    albumImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    playUrl: 'https://open.spotify.com/track/example6',
    rewardDate: '2025-10-13',
    recommendedAt: '2025-10-13T21:45:00Z',
    genre: 'Alternative',
    emotionLabel: '예민',
    reason: '사소한 것들이 마음에 걸렸던 하루, 이 곡이 당신의 마음을 공감하고 위로해줄 거예요.',
  },
  {
    id: '7',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    albumImageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
    playUrl: 'https://open.spotify.com/track/example7',
    rewardDate: '2025-10-10',
    recommendedAt: '2025-10-10T19:30:00Z',
    genre: 'Ambient',
    emotionLabel: '무기력',
    reason: '아무것도 하고 싶지 않았던 당신에게 평온한 사운드로 마음의 안정을 찾아줄게요.',
  },
  {
    id: '8',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    albumImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    playUrl: 'https://open.spotify.com/track/example8',
    rewardDate: '2025-10-09',
    recommendedAt: '2025-10-09T23:50:00Z',
    genre: 'Chillout',
    emotionLabel: '무기력',
    reason: '무기력했던 당신에게 드라마틱한 멜로디로 천천히 에너지를 되찾아줄 거예요.',
  },
  {
    id: '9',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    albumImageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
    playUrl: 'https://open.spotify.com/track/example9',
    rewardDate: '2025-10-06',
    recommendedAt: '2025-10-06T20:45:00Z',
    genre: 'Acoustic',
    emotionLabel: '슬픔',
    reason: '미팅에서 실수하고 힘들었던 하루, 부드러운 선율이 당신의 감정에 공감해줄 거예요.',
  },
  {
    id: '10',
    title: 'Moonlight Sonata',
    artist: 'Piano Collective',
    album: 'Classical Collection',
    albumImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    playUrl: 'https://open.spotify.com/track/example10',
    rewardDate: '2025-10-05',
    recommendedAt: '2025-10-05T22:30:00Z',
    genre: 'Classical',
    emotionLabel: '슬픔',
    reason: '여러 일들이 겹쳐 힘들었던 당신에게 잔잔한 피아노 선율로 슬픔을 위로해줄게요.',
  },
  {
    id: '11',
    title: 'Sunrise',
    artist: 'The Harmonies',
    album: 'Morning Light',
    albumImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    playUrl: 'https://open.spotify.com/track/example11',
    rewardDate: '2025-10-03',
    recommendedAt: '2025-10-03T14:45:00Z',
    genre: 'Indie Pop',
    emotionLabel: '기쁨',
    reason: '좋은 소식으로 시작된 기분 좋은 하루를 밝은 리듬으로 함께 축하해요.',
  },
  {
    id: '12',
    title: 'Happy Days',
    artist: 'Joy Ensemble',
    album: 'Best of Joy',
    albumImageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
    playUrl: 'https://open.spotify.com/track/example12',
    rewardDate: '2025-10-02',
    recommendedAt: '2025-10-02T10:45:00Z',
    genre: 'Pop',
    emotionLabel: '기쁨',
    reason: '기쁨을 느꼈던 당신의 하루를 활기찬 멜로디로 더욱 빛나게 해줄 거예요.',
  },
];

// API 호출 시뮬레이션 함수들
export async function fetchWeeklyLP(): Promise<LPMusic[]> {
  // TODO: 실제 API 호출로 대체
  // const response = await fetch('/api/lp/weekly');
  // return response.json();
  return Promise.resolve(mockWeeklyLP);
}

export async function fetchMonthlyLP(year: number, month: number): Promise<LPMusic[]> {
  // TODO: 실제 API 호출로 대체
  // const response = await fetch(`/api/lp/monthly?year=${year}&month=${month}`);
  // return response.json();
  return Promise.resolve(mockMonthlyLP);
}

export async function fetchAllLP(): Promise<LPMusic[]> {
  // TODO: 실제 API 호출로 대체
  // const response = await fetch('/api/lp/all');
  // return response.json();
  return Promise.resolve([...mockWeeklyLP, ...mockMonthlyLP]);
}
