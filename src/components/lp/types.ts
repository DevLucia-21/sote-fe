// LP 보상 응답 타입 (API 연동용)
export interface LpRewardResponse {
  title: string;
  artist: string;
  albumImageUrl: string;
  playUrl: string;
  rewardDate: string; // ISO 날짜 형식
  recommendedAt: string; // ISO 날짜 형식
  genre?: string;
  emotionLabel?: string;
  album?: string;
  reason?: string; // 추천 이유 (optional)
}

// 내부 상태용 타입
export interface LPMusic extends LpRewardResponse {
  id: string;
  diaryEmotion?: string | null;
}
