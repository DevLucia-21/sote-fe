백엔드와 통신하는 다음 항목들은 절대 변경하면 안 됨.

🚫 1. API Endpoint URLs

백엔드와 연결된 모든 요청 URL은 절대 수정 금지.

예:

/api/auth/login
/api/diary
/api/analysis/result
/api/challenge/today
...

경로 수정 ❌

prefix 변경 ❌

파라미터 이름 변경 ❌

🚫 2. Request Parameter Names

백엔드 컨트롤러에서 받는 key 이름 그대로 유지해야 함.

예:

POST /api/diary
{
"content": "...",
"emotion": "...",
"keywords": [...]
}

→ "content"를 "text"로 바꾸면 절대 안 됨.

🚫 3. Response Schema Keys

백엔드 DTO에 있는 모든 이름은 분기 하나라도 수정 금지.

예:

{
"emotion": "sad",
"confidence": 0.92,
"summary": "..."
}

key 추가/삭제/이름 변경 ❌

타입 변경 ❌

구조 변경 ❌

🚫 4. TypeScript interface & types that mirror backend DTO

백엔드 DTO와 1:1 연결된 타입은 이름·필드 모두 변경 금지.

예:

interface AnalysisResult {
emotion: string;
confidence: number;
summary: string;
}

🚫 5. Authentication & Token flow

accessToken, refreshToken 등 토큰 키 이름 변경 금지

HTTP Header 구조 변경 금지

Bearer prefix 변경 금지

🚫 6. Business Logic Variable Names (linked to backend fields)

UI 변수명은 바꿔도 되지만,
백엔드 필드 그대로 사용하는 변수만 제외하고 변경 금지.

예:

userId

diaryId

challengeId

emotion

genre

keywordList

measuredAt

hrv

이런 것들은 백엔드가 요구하는 스키마 그대로여야 함.

✔️ 요약 (딱 한 줄로)

백엔드와 통신하는 모든 이름(API URL, request/response key, DTO 매핑된 타입)은 절대 변경 금지.