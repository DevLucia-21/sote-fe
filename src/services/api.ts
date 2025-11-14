import axios, { AxiosInstance, AxiosError } from 'axios';
import { AuthStorage } from '../utils/auth';
import type * as API from '../types/api';

// API Base URL
const BASE_URL = 'http://localhost:8080';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Access Token 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = AuthStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - 401 에러 시 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // 401 에러이고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = AuthStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // 토큰 갱신
        const response = await axios.post<API.TokenResponse>(
          `${BASE_URL}/api/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        AuthStorage.setTokens(accessToken, newRefreshToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃
        AuthStorage.clearTokens();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export const authAPI = {
  signup: (data: API.SignupRequest) => 
    apiClient.post<void>('/api/auth/signup', data),

  login: (data: API.LoginRequest) => 
    apiClient.post<API.TokenResponse>('/api/auth/login', data),

  refresh: (refreshToken: string) => 
    apiClient.post<API.TokenResponse>('/api/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) => 
    apiClient.post<void>('/api/auth/logout', { refreshToken }),
};

// ==================== USER API ====================

export const userAPI = {
  findEmail: (data: API.FindEmailRequest) => 
    apiClient.post<API.FindEmailResponse>('/api/users/find-email', data),

  findPassword: (data: API.FindPwdRequest) => 
    apiClient.post<API.FindPwdResponse>('/api/users/find-pwd', data),

  resetPasswordWithTemp: (data: API.FindPwdRequest) => 
    apiClient.post<void>('/api/users/password-reset-temp', data),

  checkSecurity: (data: API.SecurityCheckRequest) => 
    apiClient.post<API.SecurityCheckResponse>('/api/users/check-security', data),

  changePassword: (data: API.ChangePasswordRequest) => 
    apiClient.put<void>('/api/users/password', data),

  deleteAccount: () => 
    apiClient.delete<void>('/api/users/me'),
};

// ==================== PROFILE API ====================

export const profileAPI = {
  getProfile: () => 
    apiClient.get<API.ProfileResponse>('/api/users/profile'),

  updateProfile: (data: API.ProfileUpdateRequest) => 
    apiClient.put<API.ProfileResponse>('/api/users/profile', data),

  updateProfileImage: (image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    return apiClient.post<void>('/api/users/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteProfileImage: () => 
    apiClient.delete<void>('/api/users/profile/image'),

  getProfileImage: () => 
    apiClient.get<Blob>('/api/users/profile/image', { responseType: 'blob' }),
};

// ==================== GENRE API ====================

export const genreAPI = {
  getAll: () => 
    apiClient.get<API.Genre[]>('/api/genres'),
};

// ==================== SECURITY QUESTION API ====================

export const securityQuestionAPI = {
  getAll: () => 
    apiClient.get<API.SecurityQuestion[]>('/api/security-questions'),
};

// ==================== KEYWORD API ====================

export const keywordAPI = {
  getAll: () => 
    apiClient.get<API.KeywordResponse[]>('/api/users/keywords'),

  create: (data: API.KeywordCreateRequest) => 
    apiClient.post<API.KeywordResponse>('/api/users/keywords', data),

  delete: (id: number) => 
    apiClient.delete<void>(`/api/users/keywords/${id}`),
};

// ==================== DIARY API ====================

export const diaryAPI = {
  // 텍스트 일기 작성
  create: (data: API.DiaryCreateRequest) => 
    apiClient.post<API.DiaryDto>('/api/diaries', data),

  // 음성 일기 작성
  createFromStt: (data: API.DiaryCreateRequest) => 
    apiClient.post<API.DiaryDto>('/api/diaries/stt', data),

  // 일기 수정
  update: (data: API.DiaryUpdateRequest) => 
    apiClient.put<API.DiaryDto>('/api/diaries', data),

  // 일기 삭제
  delete: (date: string) => 
    apiClient.delete<void>('/api/diaries', { params: { date } }),

  // 오늘 일기 존재 여부
  checkTodayExists: () => 
    apiClient.get<boolean>('/api/diaries/today/exist'),

  // 날짜별 조회
  getByDate: (date: string) => 
    apiClient.get<API.DiaryDto>('/api/diaries', { params: { date } }),

  // 범위 조회
  getByRange: (from: string, to: string) => 
    apiClient.get<API.DiaryDto[]>('/api/diaries', { params: { from, to } }),

  // 키워드별 조회
  getByKeyword: (keywordId: number) => 
    apiClient.get<API.DiaryDto[]>(`/api/diaries/keyword/${keywordId}`),

  // 키워드 텍스트 검색
  getByKeywordText: (keyword: string) => 
    apiClient.get<API.DiaryDto[]>('/api/diaries/keyword/search', { params: { keyword } }),

  // 다중 키워드 검색
  getByKeywords: (ids: number[], mode: 'any' | 'all' = 'any') => 
    apiClient.get<API.DiaryDto[]>('/api/diaries/keywords', { params: { ids, mode } }),
};

// ==================== OCR API ====================

export const ocrAPI = {
  preview: (file: File, authToken: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<API.OcrPreviewResponse>('/api/ocr/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': authToken,
      },
    });
  },

  saveResult: (data: API.OcrRequest) => 
    apiClient.post<API.DiaryDto>('/api/ocr/results', data),
};

// ==================== STT API ====================

export const sttAPI = {
  saveResult: (data: API.SttResultRequest) => 
    apiClient.post<number>('/api/stt/results', data),

  getResult: (id: number) => 
    apiClient.get<API.SttResult>(`/api/stt/results/${id}`),

  updateResult: (id: number, text: string) => 
    apiClient.put<void>(`/api/stt/results/${id}`, { text }),
};

// ==================== ANALYSIS API ====================

export const analysisAPI = {
  run: (data: API.AnalysisRequest = {}) => 
    apiClient.post<API.AnalysisResponse>('/api/analysis', data),

  runSimple: () => 
    apiClient.post<API.AnalysisResponse>('/api/analysis/simple'),

  getByDiaryId: (diaryId: number) => 
    apiClient.get<API.AnalysisResultDto>(`/api/analysis/${diaryId}`),
};

// ==================== CHALLENGE API ====================

export const challengeAPI = {
  // 오늘의 챌린지 조회
  getToday: () => 
    apiClient.get<API.ChallengeDefinitionResponse>('/api/challenge/today'),

  // 챌린지 완료 처리
  complete: (challengeId: number) => 
    apiClient.post<API.TodayChallengeStatus>(`/api/challenge/${challengeId}/complete`),

  // 오늘 챌린지 상태
  getStatus: () => 
    apiClient.get<API.TodayChallengeStatus>('/api/challenge/status'),

  // 챌린지 뱃지 목록
  getBadges: () => 
    apiClient.get<API.ChallengeBadgeResponse[]>('/api/challenge/badges'),

  // 챌린지 완료 내역
  getHistory: () => 
    apiClient.get<API.ChallengeHistoryResponse[]>('/api/challenge/history'),

  getMonthlyHistory: (year: number, month: number) => 
    apiClient.get<API.ChallengeHistoryResponse[]>('/api/challenge/history/monthly', { 
      params: { year, month } 
    }),

  getHistoryDetail: (id: number) => 
    apiClient.get<API.ChallengeHistoryResponse>(`/api/challenge/history/${id}`),

  // 챌린지 정의 관리 (관리자용)
  definitions: {
    getAll: () => 
      apiClient.get<API.ChallengeDefinitionResponse[]>('/api/challenge/definitions'),

    create: (data: any) => 
      apiClient.post<number>('/api/challenge/definitions', data),

    update: (id: number, data: any) => 
      apiClient.put<void>(`/api/challenge/definitions/${id}`, data),

    delete: (id: number) => 
      apiClient.delete<void>(`/api/challenge/definitions/${id}`),
  },
};

// ==================== LP REWARD API ====================

export const lpAPI = {
  getToday: () => 
    apiClient.get<API.LpRewardResponse>('/api/lp/today'),

  getWeekly: (year?: number, week?: number) => 
    apiClient.get<API.LpRewardResponse[]>('/api/lp/weekly', { 
      params: year && week ? { year, week } : {} 
    }),

  getMonthly: (year: number, month: number) => 
    apiClient.get<API.LpRewardResponse[]>('/api/lp/monthly', { params: { year, month } }),

  getAll: () => 
    apiClient.get<API.LpRewardResponse[]>('/api/lp/all'),
};

// ==================== CALENDAR NOTE API ====================

export const calendarAPI = {
  getMonthly: (year: number, month: number) => 
    apiClient.get<API.CalendarNoteDto[]>(`/api/calendar-notes/${year}/${month}`),

  getDaily: (year: number, month: number, day: number) => 
    apiClient.get<API.CalendarNoteDto>(`/api/calendar-notes/${year}/${month}/${day}`),

  getWeekly: (year: number, month: number, day: number) => 
    apiClient.get<API.CalendarNoteDto[]>(`/api/calendar-notes/${year}/${month}/${day}/week`),
};

// ==================== SETTINGS API ====================

export const settingsAPI = {
  // 알림 설정
  getNotifications: () => 
    apiClient.get<API.NotificationSettingResponse>('/api/settings/notifications'),

  updateNotifications: (data: API.NotificationSettingRequest) => 
    apiClient.put<void>('/api/settings/notifications', data),

  // 테마 설정
  getTheme: () => 
    apiClient.get<API.ThemeSettingResponse>('/api/settings/theme'),

  updateTheme: (data: API.ThemeSettingRequest) => 
    apiClient.put<void>('/api/settings/theme', data),

  // FCM 토큰
  registerToken: (token: string) => 
    apiClient.post<void>('/api/settings/token', { token }),

  deleteToken: (token: string) => 
    apiClient.delete<void>('/api/settings/token', { params: { token } }),

  // 테스트 알림
  sendTestNotification: (targetToken: string, title: string, body: string) => 
    apiClient.post<void>('/api/settings/send', null, { 
      params: { targetToken, title, body } 
    }),
};

// ==================== QUESTION API ====================

export const questionAPI = {
  getAll: () => 
    apiClient.get<API.QuestionDto[]>('/questions'),

  getById: (id: number) => 
    apiClient.get<API.QuestionDto>(`/questions/${id}`),

  create: (data: API.QuestionDto) => 
    apiClient.post<API.QuestionDto>('/questions', data),

  update: (id: number, data: API.QuestionDto) => 
    apiClient.put<API.QuestionDto>(`/questions/${id}`, data),

  delete: (id: number) => 
    apiClient.delete<void>(`/questions/${id}`),

  getToday: () => 
    apiClient.get<API.QuestionDto>('/questions/today'),

  // 답변 API
  answers: {
    create: (questionId: number, data: API.QuestionAnswerCreateRequest) => 
      apiClient.post<API.QuestionAnswerResponse>(`/api/questions/${questionId}/answers`, data),

    update: (answerId: number, data: API.QuestionAnswerUpdateRequest) => 
      apiClient.put<API.QuestionAnswerResponse>(`/api/questions/answers/${answerId}`, data),

    getMyMonthly: (month?: string) => 
      apiClient.get<API.QuestionAnswerMonthlyItem[]>('/api/questions/answers/me', { 
        params: month ? { month } : {} 
      }),

    checkExists: (questionId: number, month?: string) => 
      apiClient.get<boolean>(`/api/questions/${questionId}/answers/me/exist`, { 
        params: month ? { month } : {} 
      }),
  },
};

// ==================== STATISTICS API ====================

export const statisticsAPI = {
  getDiary: (period: string) => 
    apiClient.get<API.DiaryStatsResponse>('/api/statistics/diary', { params: { period } }),

  getAnalysis: (period: string) => 
    apiClient.get<API.AnalysisStatsResponse>('/api/statistics/analysis', { params: { period } }),

  getChallengeCompletion: (period: string) => 
    apiClient.get<API.ChallengeCompletionResponse>('/api/statistics/challenges/completion-rate', { 
      params: { period } 
    }),

  getChallengeEmotionPerformance: (period: string) => 
    apiClient.get<API.ChallengeEmotionPerformanceResponse>('/api/statistics/challenges/emotion-performance', { 
      params: { period } 
    }),

  getChallengeBadges: (period: string) => 
    apiClient.get<API.ChallengeBadgeStatsResponse>('/api/statistics/challenges/badges', { 
      params: { period } 
    }),

  getMusic: (period: string) => 
    apiClient.get<API.MusicStatsResponse>('/api/statistics/music', { params: { period } }),

  getKeywordRanking: (period: string) => 
    apiClient.get<API.KeywordRankingResponse>('/api/statistics/keywords/ranking', { 
      params: { period } 
    }),

  getKeywordEmotionRanking: (period: string) => 
    apiClient.get<API.KeywordEmotionRankingResponse>('/api/statistics/keywords/emotion-ranking', { 
      params: { period } 
    }),

  getKeywordExplore: (period: string) => 
    apiClient.get<API.KeywordExploreResponse>('/api/statistics/keywords/explore', { 
      params: { period } 
    }),
};

// ==================== STRESS API ====================

export const stressAPI = {
  upload: (hrv: number, measuredAt: string) => 
    apiClient.post<API.StressDto>('/api/watch/stress', null, { 
      params: { hrv, measuredAt } 
    }),

  getToday: () => 
    apiClient.get<API.StressDto>('/api/watch/stress/today'),

  getStats: (from: string, to: string) => 
    apiClient.get<API.StressDto[]>('/api/watch/stress/stats', { params: { from, to } }),
};

// ==================== WATCH AUTH API ====================

export const watchAuthAPI = {
  // 웹에서 호출: 페어링 코드 발급
  createPairCode: () => 
    apiClient.post<API.WatchPairCodeResponse>('/api/watch/auth/pair-code'),

  // 워치에서 호출: 페어링 코드로 로그인
  pair: (data: API.WatchPairLoginRequest) => 
    apiClient.post<API.TokenResponse>('/api/watch/auth/pair', data),
};

// ==================== HEALTH DATA API ====================

export const healthAPI = {
  // 단건 저장
  save: (data: API.HealthRequest) => 
    apiClient.post<API.HealthResponse>('/api/health/save', data),

  // 배치 저장 (최대 100건)
  saveBulk: (data: API.HealthRequest[]) => 
    apiClient.post<API.HealthResponse[]>('/api/health/save/bulk', data),

  // 오늘 건강 데이터
  getToday: (userId: number) => 
    apiClient.get<API.HealthResponse>('/api/health/today', { params: { userId } }),

  // 요약 데이터
  getSummary: (userId: number, period: string = 'weekly') => 
    apiClient.get<API.HealthSummaryResponse[]>('/api/health/summary', { 
      params: { userId, period } 
    }),
};

export default apiClient;