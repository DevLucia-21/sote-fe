// 질문 타입
export interface Question {
  id: number;
  content: string;
  questionDay: number; // 1~31
}

// 답변 타입
export interface Answer {
  id: number;
  questionId: number;
  questionContent: string;
  questionDay: number;
  answerText: string;
  answeredAt: string; // ISO 8601 format (OffsetDateTime)
  updatedAt?: string;
  answerMonth: string; // YYYY-MM-01 format
}

// 답변 존재 여부 응답
export interface AnswerExistResponse {
  exists: boolean;
  answerId?: number;
}

// 답변 작성 요청
export interface CreateAnswerRequest {
  answerText: string;
}

// 답변 수정 요청
export interface UpdateAnswerRequest {
  answerText: string;
}
