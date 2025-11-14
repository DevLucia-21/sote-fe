# 감정 분석 (Analysis) 컴포넌트

S:ote 일기 서비스의 AI 감정 분석 기능을 담당하는 컴포넌트입니다.

## 📁 파일 구조

```
/components/analysis/
├── AnalysisLoading.tsx    # 감정 분석 로딩 화면
├── AnalysisResult.tsx     # 분석 결과 메인 화면
├── EmotionCard.tsx        # 감정 요약 카드
├── MusicCard.tsx          # 음악 추천 카드
├── ChallengeCard.tsx      # 챌린지 추천 카드
├── types.ts               # TypeScript 타입 정의
├── mockData.ts            # 목 데이터 및 스타일
└── index.ts               # Export 파일
```

## 🎨 주요 컴포넌트

### 1. AnalysisLoading
감정 분석이 진행 중일 때 표시되는 로딩 화면입니다.

**기능:**
- 3단계 분석 과정 시각화 (텍스트 이해 → 감정 추출 → 음악 추천)
- 애니메이션 악기 캐릭터
- 로딩 메시지 자동 순환
- 타임아웃 및 에러 처리

**Props:**
```typescript
interface AnalysisLoadingProps {
  instrument?: InstrumentType;  // 악기 종류
  onRetry?: () => void;          // 재시도 콜백
  onComplete?: () => void;       // 완료 콜백
}
```

### 2. AnalysisResult
분석 완료 후 결과를 표시하는 메인 화면입니다.

**구성:**
- 감정 요약 카드 (EmotionCard)
- 음악 추천 카드 (MusicCard)
- 챌린지 추천 카드 (ChallengeCard)

**Props:**
```typescript
interface AnalysisResultProps {
  result: AnalysisResult;        // 분석 결과 데이터
  instrument?: InstrumentType;   // 악기 종류
  onBack?: () => void;           // 뒤로가기 콜백
  onAddToLP?: () => void;        // LP 추가 콜백
  onAcceptChallenge?: () => void; // 챌린지 수락 콜백
}
```

### 3. EmotionCard
사용자의 감정 분석 결과를 표시하는 카드입니다.

**표시 정보:**
- 감정 라벨 (기쁨/슬픔/분노/예민/무기력)
- 신뢰도 퍼센트 (0-100%)
- 분석 이유
- 감정 설명
- 악기 캐릭터

### 4. MusicCard
감정에 맞는 음악을 추천하는 카드입니다.

**표시 정보:**
- 곡 제목, 아티스트, 장르
- 애니메이션 음파형
- 추천 이유
- LP 추가 및 재생 버튼

### 5. ChallengeCard
감정 기반 챌린지를 추천하는 카드입니다.

**표시 정보:**
- 챌린지 제목 및 설명
- 기대 효과
- 도전하기 버튼

## 🎭 감정 타입 (EmotionType)

```typescript
type EmotionType = '기쁨' | '슬픔' | '분노' | '예민' | '무기력';
```

각 감정별 스타일 토큰:

| 감정 | 배경 색상 | 강조 색상 | 캐릭터 표정 |
|------|-----------|-----------|-------------|
| 기쁨 | #FFF3C4 | #FFD700 | happy |
| 슬픔 | #CDE3F8 | #6BA3D8 | sad |
| 분노 | #F8C4C4 | #E85D5D | angry |
| 무기력 | #E6E6E6 | #999999 | tired |
| 예민 | #E7D5F8 | #A985D8 | sensitive |

## 🎵 악기 타입 (InstrumentType)

```typescript
type InstrumentType = 'guitar' | 'piano' | 'drum' | 'violin' | 'saxophone';
```

## 📊 데이터 구조

### AnalysisResult
```typescript
interface AnalysisResult {
  id: string;
  date: string;
  emotion: EmotionType;
  confidence: number; // 0-100
  reason: string;
  description: string;
  music: MusicRecommendation;
  challenge: ChallengeRecommendation;
}
```

### MusicRecommendation
```typescript
interface MusicRecommendation {
  title: string;
  artist: string;
  genre: string;
  albumCover?: string;
  reason: string;
}
```

### ChallengeRecommendation
```typescript
interface ChallengeRecommendation {
  id: string;
  title: string;
  description: string;
  emotion: EmotionType;
}
```

## 🚀 사용 예시

### DiaryEntry에 통합됨
분석 컴포넌트는 `DiaryEntry.tsx`에 자동으로 통합되어 있습니다.

일기 저장 → 분석 로딩 → 분석 결과 순서로 자동 진행됩니다.

```typescript
// DiaryEntry.tsx에서의 사용 예시
const handleSave = (diary: Partial<Diary>) => {
  console.log('Saved diary:', diary);
  // 일기 저장 후 분석 시작
  setIsWriting(false);
  setAnalysisState('analyzing');
};

const handleAnalysisComplete = () => {
  // 분석 완료 후 결과 생성
  const mockResult = generateMockAnalysisResult();
  setAnalysisResult(mockResult);
  setAnalysisState('completed');
};
```

### 독립 사용 (필요시)
```typescript
import { AnalysisLoading, AnalysisResult } from './components/analysis';

function MyComponent() {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  if (isAnalyzing) {
    return (
      <AnalysisLoading
        instrument="piano"
        onComplete={() => {
          setIsAnalyzing(false);
          // Fetch or generate result
        }}
      />
    );
  }

  return (
    <AnalysisResult
      result={result}
      instrument="piano"
      onBack={() => {/* 뒤로가기 */}}
      onAddToLP={() => {/* LP 추가 */}}
      onAcceptChallenge={() => {/* 챌린지 수락 */}}
    />
  );
}
```

## 🎨 디자인 가이드라인

### 색상 팔레트
- 메인 배경: `#F5F1E8` (베이지)
- 메인 텍스트: `#4A3228` (다크 브라운)
- 보조 색상: `#FFFFFF`, `#E5E5E5`
- 포인트 컬러: `#7B8B4F` (올리브 그린)
- 보조 포인트: `#5D3F35` (와인 브라운)

### 애니메이션
- Motion (Framer Motion) 사용
- 카드 진입: fade-in + slide up
- 로딩: 회전, 스케일, 파동 효과
- 진행바: 부드러운 증가 애니메이션

### 반응형
- 모바일 우선 디자인
- 최대 너비 `max-w-2xl` (768px)
- 적절한 패딩 및 여백

## 🔧 통합 가이드

### API 연동 시 고려사항

1. **분석 요청**
```typescript
// 일기 작성 완료 후 분석 요청
const requestAnalysis = async (diaryId: string) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ diaryId }),
    });
    return await response.json();
  } catch (error) {
    // 에러 처리
  }
};
```

2. **실시간 진행 상태**
```typescript
// WebSocket 또는 폴링으로 진행 상태 업데이트
const checkProgress = async (analysisId: string) => {
  const response = await fetch(`/api/analyze/${analysisId}/progress`);
  return await response.json();
};
```

3. **결과 조회**
```typescript
const getAnalysisResult = async (analysisId: string) => {
  const response = await fetch(`/api/analyze/${analysisId}/result`);
  return await response.json();
};
```

## 📝 TODO / 향후 개선사항

- [ ] 실제 API 연동
- [ ] 음악 재생 기능 구현
- [ ] 챌린지 상세 페이지
- [ ] 분석 결과 공유 기능
- [ ] 다크 모드 지원
- [ ] 접근성 개선 (ARIA labels)
- [ ] 다국어 지원

## 🐛 알려진 이슈

- 로딩 시뮬레이션은 현재 고정 시간(약 15초)으로 설정되어 있음
- 실제 악기 캐릭터 일러스트는 아이콘으로 대체되어 있음
- 음악 재생 기능은 아직 구현되지 않음

## 📄 라이선스

S:ote 프로젝트의 일부입니다.
