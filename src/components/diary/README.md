# S:ote 다이어리 시스템

AI 감성분석 기반 개인 맞춤형 일기 작성 시스템입니다.

## 🎯 주요 기능

### 1. 다이어리 홈 (DiaryHome)
- 📅 캘린더 뷰: 날짜별 일기 조회
- 📋 리스트 뷰: 전체 일기 목록
- 🔍 필터링: 기간, 키워드, 검색어
- ✨ 오늘 일기 CTA: 작성되지 않은 경우 표시

### 2. 일기 작성 (DiaryWrite)
3가지 작성 방식을 지원합니다:

#### TEXT (텍스트)
- 자유로운 텍스트 입력
- 글자 수 표시
- 실시간 입력

#### STT (음성)
- 오디오 파일 업로드
- 자동 음성 전사
- 전사 결과 수정 가능
- 진행 상태 표시

#### OCR (손글씨)
- 손글씨 이미지 업로드 (JPG/PNG, 10MB 이하)
- 자동 텍스트 인식
- 원본 이미지 보관
- 인식 결과 수정 가능

#### 공통 필드
- 📅 날짜 선택 (미래 날짜 불가)
- 🏷️ 키워드 선택 (최대 5개)
- 😊 감정 선택 (선택 사항): 기쁨, 슬픔, 분노, 예민, 무기력

### 3. 일기 상세 보기 (DiaryDetail)
- 📄 전체 내용 표시
- 🏷️ 키워드 목록
- 😊 감정 배지
- 📝 작성 방식 표시
- 🖼️ OCR 원본 이미지 (해당 시)
- 🔄 감정 재분석 기능
- ✏️ 수정 버튼
- 🗑️ 삭제 버튼

### 4. 일기 수정 (DiaryEdit)
- 작성 화면과 동일한 UI
- 날짜 변경 불가
- 저장 시 자동 감정 재분석

### 5. 워치 STT 업로드 (WatchSTTUpload)
스마트워치 음성 일기 업로드:
- 📤 오디오 파일 업로드
- 🔄 3단계 프로세스: 업로드 → 전사 → 저장
- 📊 진행률 표시
- 📝 결과 미리보기
- ✅ 자동으로 오늘 날짜 일기 생성

## 📊 데이터 모델

```typescript
interface Diary {
  id: number;
  date: string; // YYYY-MM-DD
  content: string;
  writeType: 'TEXT' | 'STT' | 'OCR';
  emotionType?: '기쁨' | '슬픔' | '분노' | '예민' | '무기력';
  imageUrl?: string; // OCR용
  keywords: string[];
  analysisStatus?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt?: string;
  updatedAt?: string;
}
```

## 🚦 제약사항

- ❌ 같은 날짜에 일기 중복 작성 불가
- ❌ 미래 날짜 일기 작성 불가
- 🏷️ 키워드 최대 5개 선택
- 🔍 필터 키워드 최대 3개 선택

## 🎨 디자인 시스템

### 색상
- 배경: `#F5F1E8` (베이지)
- 메인 텍스트: `#4A3228` (다크 브라운)
- 포인트: `#7B8B4F` (올리브 그린)
- 보조: `#7B3E2E` (와인 브라운)
- 카드 테두리: `#E6E0D6`

### 감정별 색상
```typescript
{
  '기쁨': { bg: '#FFF9E6', text: '#F59E0B', border: '#FDE68A' },
  '슬픔': { bg: '#EFF6FF', text: '#3B82F6', border: '#BFDBFE' },
  '분노': { bg: '#FEE2E2', text: '#EF4444', border: '#FECACA' },
  '예민': { bg: '#F3E8FF', text: '#A855F7', border: '#E9D5FF' },
  '무기력': { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' }
}
```

## 📝 사용 예시

### 기본 사용
```tsx
import { DiaryManager } from './components/diary';

function App() {
  return <DiaryManager onBack={() => console.log('back')} />;
}
```

### 개별 컴포넌트 사용
```tsx
import { DiaryHome, DiaryWrite } from './components/diary';

function CustomDiaryFlow() {
  const [view, setView] = useState('home');
  
  return view === 'home' ? (
    <DiaryHome 
      onWriteNew={() => setView('write')}
      onViewDetail={(diary) => console.log(diary)}
    />
  ) : (
    <DiaryWrite
      onBack={() => setView('home')}
      onSave={(data) => console.log(data)}
    />
  );
}
```

## 🔧 API 컨텍스트 (참고)

실제 백엔드 연동 시 참고할 API 엔드포인트:

```
POST   /api/diaries          # 텍스트 일기 작성
POST   /api/diaries/stt      # 음성 일기 작성
PUT    /api/diaries          # 일기 수정
DELETE /api/diaries?date=YYYY-MM-DD
GET    /api/diaries/today/exist
GET    /api/diaries?date=YYYY-MM-DD
GET    /api/diaries?from=YYYY-MM-DD&to=YYYY-MM-DD
GET    /api/diaries/keyword/{keywordId}
GET    /api/diaries/keyword/search?keyword=...
GET    /api/diaries/keywords?ids=1,2,3&mode=any|all
POST   /api/watch/diary/stt  # 워치 STT 업로드
```

## 📦 컴포넌트 구조

```
diary/
├── types.ts              # 타입 정의
├── mockData.ts           # 목 데이터
├── DiaryManager.tsx      # 메인 통합 컴포넌트
├── DiaryHome.tsx         # 홈 화면
├── DiaryWrite.tsx        # 작성/수정 화면
├── DiaryDetail.tsx       # 상세 보기
├── WatchSTTUpload.tsx    # 워치 업로드
├── DiaryCard.tsx         # 일기 카드
├── EmotionBadge.tsx      # 감정 배지
├── WriteTypeBadge.tsx    # 작성 타입 배지
├── KeywordChip.tsx       # 키워드 칩
└── index.ts              # Export 관리
```

## 🎯 상태 관리

### 로딩 상태
- 스켈레톤 UI 표시
- 3개 카드 플레이스홀더

### 빈 상태
- 아이콘 + 메시지 + CTA 버튼
- "아직 작성된 일기가 없어요. 오늘 일기 쓰기"

### 에러 상태
- 미래 일기: "미래 일기는 작성할 수 없습니다."
- 중복 날짜: "이미 작성한 일기가 있습니다."
- 키워드 초과: "키워드는 최대 5개까지만 선택할 수 있습니다."

## 💡 마이크로카피

```
✅ 저장 완료: "일기를 저장했어요. 감정 분석을 시작합니다."
❌ 중복: "이미 작성한 일기가 있습니다."
❌ 미래: "미래 일기는 작성할 수 없습니다."
❌ 키워드: "키워드는 최대 5개까지만 선택할 수 있습니다."
🔄 재분석: "일기를 수정하면 감정 재분석이 자동으로 진행됩니다."
```

## 🚀 향후 개선 사항

- [ ] 실제 백엔드 API 연동
- [ ] 오프라인 지원 (LocalStorage/IndexedDB)
- [ ] 음성 실시간 녹음 기능
- [ ] 사진 첨부 기능 확장
- [ ] 일기 공유 기능
- [ ] 감정 통계 그래프
- [ ] 일기 검색 개선 (전문 검색)
- [ ] 다국어 지원

## 📄 라이선스

S:ote Project - 2025
