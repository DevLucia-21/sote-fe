import { Question } from './types';

// 1~31일 질문 시드 데이터
export const MOCK_QUESTIONS: Question[] = [
  { id: 1, content: '오늘 어떤 일이 있었나요?', questionDay: 1 },
  { id: 2, content: '오늘 기분은 어땠나요?', questionDay: 2 },
  { id: 3, content: '오늘 감사한 일은 무엇인가요?', questionDay: 3 },
  { id: 4, content: '오늘 가장 기억에 남는 순간은?', questionDay: 4 },
  { id: 5, content: '오늘 누군가에게 해준 친절한 행동이 있나요?', questionDay: 5 },
  { id: 6, content: '오늘 새롭게 배운 것이 있나요?', questionDay: 6 },
  { id: 7, content: '오늘 나를 웃게 한 것은?', questionDay: 7 },
  { id: 8, content: '오늘 도전한 일이 있나요?', questionDay: 8 },
  { id: 9, content: '오늘 가장 맛있게 먹은 음식은?', questionDay: 9 },
  { id: 10, content: '최근 구매한 물건 중 가장 자랑하고 싶은 물건은?', questionDay: 10 },
  { id: 11, content: '오늘 날씨는 어땠고, 어떤 기분이 들었나요?', questionDay: 11 },
  { id: 12, content: '오늘 듣고 싶은 말이 있나요?', questionDay: 12 },
  { id: 13, content: '오늘 하루 중 가장 평화로웠던 시간은?', questionDay: 13 },
  { id: 14, content: '오늘 나에게 해주고 싶은 칭찬은?', questionDay: 14 },
  { id: 15, content: '이번 주 가장 뿌듯했던 순간은?', questionDay: 15 },
  { id: 16, content: '요즘 가장 관심 있는 것은?', questionDay: 16 },
  { id: 17, content: '오늘 누군가와 나눈 인상 깊은 대화가 있나요?', questionDay: 17 },
  { id: 18, content: '오늘 가장 집중했던 일은?', questionDay: 18 },
  { id: 19, content: '오늘 스스로에게 자랑하고 싶은 일이 있나요?', questionDay: 19 },
  { id: 20, content: '이번 주를 3가지 단어로 표현한다면?', questionDay: 20 },
  { id: 21, content: '요즘 가장 듣고 싶은 노래는?', questionDay: 21 },
  { id: 22, content: '오늘 가장 편안했던 순간은?', questionDay: 22 },
  { id: 23, content: '요즘 하고 싶은 일이 있나요?', questionDay: 23 },
  { id: 24, content: '오늘 나를 위해 한 작은 선물은?', questionDay: 24 },
  { id: 25, content: '이번 달 가장 기억에 남는 일은?', questionDay: 25 },
  { id: 26, content: '요즘 나를 힘들게 하는 것은 무엇인가요?', questionDay: 26 },
  { id: 27, content: '이번 달에 이루고 싶은 목표는?', questionDay: 27 },
  { id: 28, content: '오늘 가장 아쉬웠던 일은?', questionDay: 28 },
  { id: 29, content: '내일은 어떤 하루가 되었으면 좋겠나요?', questionDay: 29 },
  { id: 30, content: '이번 달 나에게 수고했다고 말해주고 싶나요?', questionDay: 30 },
  { id: 31, content: '저번 달/다음 달의 나에게 한 마디?', questionDay: 31 },
];

// 질문 ID로 질문 찾기
export const getQuestionById = (id: number): Question | undefined => {
  return MOCK_QUESTIONS.find(q => q.id === id);
};

// 오늘의 질문 가져오기 (날짜 기반)
export const getTodayQuestion = (): Question => {
  const today = new Date();
  const day = today.getDate(); // 1~31
  return MOCK_QUESTIONS.find(q => q.questionDay === day) || MOCK_QUESTIONS[0];
};

// 전역 Mock 답변 저장소 (day + month를 키로 사용)
// 실제 프로덕션에서는 API/DB에서 가져오지만, Mock에서는 메모리에 저장
const mockAnswerStore = new Map<string, string>();

// 답변 키 생성 (day-month 형태)
const getAnswerKey = (day: number, month: string): string => {
  return `${day}-${month}`;
};

// Mock 답변 내용 목록
const MOCK_ANSWER_TEXTS = [
  '오늘은 정말 의미 있는 하루였어요. 많은 것을 배우고 느꼈습니다.',
  '그때는 정말 힘든 시기였어요. 하지만 그 경험이 지금의 나를 만들었어요.',
  '행복했던 순간이었네요. 친구들과 함께한 시간이 너무 소중했어요.',
  '새로운 도전을 시작했던 때예요. 두려웠지만 용기를 냈던 순간이었어요.',
  '평온한 일상이 이렇게 감사한 줄 몰랐어요. 작은 것들의 소중함을 배웠어요.',
  '변화의 시기였어요. 많은 것들을 놓아주고 새로운 것들을 받아들였어요.',
  '가족과 함께한 특별한 시간이었어요. 사랑하는 사람들의 소중함을 느꼈어요.',
  '혼자만의 시간을 가지며 많은 생각을 했어요. 내면의 성장을 경험했어요.',
  '목표를 향해 달려가던 시기예요. 열정적으로 살았던 나를 응원해요.',
  '쉬어가는 시간이 필요했어요. 멈춤의 중요성을 깨달았어요.',
  '새로운 관계를 맺었던 때예요. 좋은 사람들을 만나 감사했어요.',
  '내가 원하는 것이 무엇인지 깊이 고민했어요. 진정한 나를 찾아가는 중이에요.',
  '작은 성취들이 쌓여 큰 변화를 만들었어요. 꾸준함의 힘을 믿게 되었어요.',
  '쉬어가는 시간이 필요했어요. 멈춤의 중요성을 깨달았어요.',
];

// 답변 가져오기 또는 생성
export const getMockAnswer = (day: number, month: string): string => {
  const key = getAnswerKey(day, month);
  
  // 이미 생성된 답변이 있으면 반환
  if (mockAnswerStore.has(key)) {
    return mockAnswerStore.get(key)!;
  }
  
  // 새로운 답변 생성 (day + month를 시드로 사용하여 일관성 유지)
  const seed = (day * 100) + parseInt(month.split('-')[1] || '1');
  const index = seed % MOCK_ANSWER_TEXTS.length;
  const answer = MOCK_ANSWER_TEXTS[index];
  
  // 저장소에 저장
  mockAnswerStore.set(key, answer);
  return answer;
};

// 답변 저장 (새로 작성하거나 수정할 때)
export const saveMockAnswer = (day: number, month: string, answerText: string): void => {
  const key = getAnswerKey(day, month);
  mockAnswerStore.set(key, answerText);
};

// 답변이 존재하는지 확인
export const hasAnswer = (day: number, month: string): boolean => {
  const key = getAnswerKey(day, month);
  return mockAnswerStore.has(key);
};