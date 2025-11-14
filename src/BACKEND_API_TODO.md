# 백엔드 API 최종 정리

## ✅ 백엔드 구현 완료 - 추가 작업 불필요!

모든 필요한 API가 백엔드에 구현되어 있습니다.

### 1. 손글씨 캔버스 저장 API ✅
```java
@PostMapping("/api/diaries/canvas")
public ResponseEntity<DiaryDto> writeFromCanvas(@RequestBody CanvasRequest request)
```

### 2. 챌린지 완료 내역 조회 API ✅
```java
@GetMapping("/api/challenge/history")
public ResponseEntity<List<ChallengeHistoryResponse>> getHistory(@RequestAttribute("user") User user)
```

### 3. LP 응답 형식 ✅
- `id`, `title`, `artist`, `album`, `albumImageUrl`, `playUrl`, `rewardDate`, `recommendedAt` 모두 포함

### 4. 챌린지 완료 시 LP 보상 자동 지급 ✅
- `TodayChallengeStatus`에 `reward` 필드 포함

### 5. 감정 분석 로직 ✅
**백엔드에서 자동으로 처리:**
- **오늘 일기 작성**: 감정 분석 + 음악 + 챌린지 + LP
- **과거 날짜 일기 작성**: 감정 분석 + 음악만 (챌린지/LP 제외)
- **이미 분석된 일기 수정**: 재분석 안 됨 (의도된 동작)

**재분석 API 불필요**: 이미 작성된 일기는 수정해도 재분석하지 않는 것이 정책

---

## 🎯 프론트엔드 API 연동 준비 완료

### ✅ 바로 연동 가능한 화면

#### 1️⃣ 캘린더 화면
```typescript
// 월별 음표 조회
GET /api/calendar-notes/{year}/{month}

// 응답 예시
[
  {
    year: 2025,
    month: 11,
    day: 10,
    emotion: "JOY",        // EmotionType enum
    score: 4.2,
    note: "SOL"            // Note enum
  }
]

// 사용 컴포넌트: /components/CalendarView.tsx
// 현재: mockDiaryData 사용 → API 호출로 교체
```

#### 2️⃣ 날짜 클릭 시 일기 조회
```typescript
// 특정 날짜 일기 조회
GET /api/diaries?date=2025-11-10

// 응답: DiaryDto
{
  id: 123,
  date: "2025-11-10",
  content: "일기 내용...",
  writeType: "TEXT",
  emotion: "JOY",
  score: 4.2,
  note: "SOL",
  keywords: [
    { id: 1, name: "행복" },
    { id: 2, name: "친구" }
  ]
}

// 사용 컴포넌트: /components/CalendarView.tsx, /components/diary/*
// 현재: getDiaryByDate() Mock 함수 → API 호출로 교체
```

#### 3️⃣ 질문 탭
```typescript
// 오늘의 질문 조회
GET /questions/today

// 내 답변 여부 확인
GET /api/questions/{questionId}/answers/me/exist

// 답변 작성
POST /api/questions/{questionId}/answers
{
  content: "답변 내용..."
}

// 월별 답변 히스토리
GET /api/questions/answers/me?month=2025-11

// 사용 컴포넌트: /components/questions/*
// 현재: mockQuestions, getMockAnswer() → API 호출로 교체
```

---

## 📝 프론트엔드 API 연동 작업 체크리스트

### 우선순위 1 (핵심 기능) - 바로 연동 가능 ✅
- [ ] **인증** (로그인/회원가입/토큰 갱신)
  - `POST /api/auth/login`
  - `POST /api/auth/signup`
  - `POST /api/auth/refresh`
  
- [ ] **캘린더 화면**
  - `GET /api/calendar-notes/{year}/{month}` → `/components/CalendarView.tsx`
  - Mock 데이터: `mockDiaryData` 제거
  
- [ ] **일기 조회**
  - `GET /api/diaries?date={date}` → `/components/diary/DiaryHome.tsx`
  - Mock 함수: `getDiaryByDate()` 제거
  
- [ ] **일기 작성**
  - `POST /api/diaries` (텍스트)
  - `POST /api/diaries/stt` (음성)
  - `POST /api/diaries/canvas` (손글씨)
  - Mock 함수: `addDiaryEntry()` 제거
  
- [ ] **일기 수정/삭제**
  - `PUT /api/diaries`
  - `DELETE /api/diaries?date={date}`
  
- [ ] **감정 분석 API 연동**
  - `POST /api/analysis` → `/components/analysis/AnalysisView.tsx`
  - `GET /api/analysis/{diaryId}` (결과 조회)
  
- [ ] **질문 답변**
  - `GET /questions/today` → `/components/questions/TodayQuestion.tsx`
  - `POST /api/questions/{questionId}/answers`
  - `GET /api/questions/answers/me?month={month}` → `/components/questions/MonthlyAnswers.tsx`
  - Mock 함수: `getTodayQuestion()`, `getMockAnswer()` 제거
  
- [ ] **오늘의 챌린지**
  - `GET /api/challenge/today`
  - `POST /api/challenge/{challengeId}/complete`
  - `GET /api/challenge/status`
  
- [ ] **LP 보상 조회**
  - `GET /api/lp/today`
  - `GET /api/lp/weekly` → `/components/MusicLP.tsx`
  - `GET /api/lp/monthly`
  - Mock 함수: `fetchWeeklyLP()`, `fetchMonthlyLP()` 제거

### 우선순위 2 (부가 기능)
- [ ] **키워드 관리**
  - `GET /api/users/keywords`
  - `POST /api/users/keywords`
  - `DELETE /api/users/keywords/{id}`
  - Mock 데이터: `mockKeywords` 제거
  
- [ ] **OCR/STT 처리**
  - `POST /api/ocr/preview`
  - `POST /api/ocr/results`
  - `POST /api/stt/results`
  
- [ ] **프로필 관리**
  - `GET /api/users/profile`
  - `PUT /api/users/profile`
  - `POST /api/users/profile/image`
  
- [ ] **설정 (알림/테마)**
  - `GET /api/settings/notifications`
  - `PUT /api/settings/notifications`
  - `GET /api/settings/theme`
  - `PUT /api/settings/theme`

### 우선순위 3 (고급 기능)
- [ ] **통계 페이지**
  - `GET /api/statistics/diary?period={period}`
  - `GET /api/statistics/analysis?period={period}`
  - `GET /api/statistics/keywords/ranking?period={period}`
  
- [ ] **챌린지 뱃지 갤러리**
  - `GET /api/challenge/badges`
  - `GET /api/challenge/history`
  
- [ ] **스트레스 데이터 (워치)**
  - `POST /api/watch/stress`
  - `GET /api/watch/stress/today`

---

## 🔧 API 연동 시 주의사항

1. **Enum 타입 변환**
   - 백엔드: `JOY`, `SADNESS`, `ANGER`, `APATHY`, `SENSITIVE` (영문 대문자)
   - UI 표시: `기쁨`, `슬픔`, `분노`, `무기력`, `예민` (한글)
   - `EMOTION_LABELS` 매핑 사용 필수

2. **날짜 형식**
   - 백엔드 파라미터: `YYYY-MM-DD` 문자열 또는 `year/month/day` 숫자
   - 프론트엔드: `Date` 객체 → 적절한 형식으로 변환 필요

3. **토큰 관리**
   - Access Token 자동 헤더 추가 (Interceptor 구현 완료)
   - 401 에러 시 Refresh Token으로 자동 갱신 (Interceptor 구현 완료)

4. **에러 처리**
   - API 에러 시 사용자 친화적 메시지 표시
   - 네트워크 에러, 서버 에러 구분 처리

5. **로딩 상태**
   - API 호출 중 로딩 UI 표시
   - 중복 요청 방지

6. **과거 일기 제약**
   - 과거 일기: 감정 분석 + 음악 추천만
   - 오늘 일기: 챌린지 + LP 획득 가능
   - API 호출 전 날짜 확인 필요

7. **키워드 필수 여부**
   - 키워드는 선택 사항 (필수 아님)
   - 일기 내용은 최소 10자 이상

---

## ✨ 결론

**백엔드에 추가가 필요한 새로운 API는 거의 없습니다.** 다만 다음 사항을 확인하고 조정해야 합니다:

1. LP 보상 응답 형식에 `id`, `album`, `rewardDate`, `recommendedAt` 추가 여부
2. 챌린지 완료 시 LP 자동 지급 로직 확인
3. 프로필 이미지 사용 방식 확인

이제 **프론트엔드 Mock 데이터를 실제 API 호출로 교체하는 작업**을 진행하면 됩니다!