# Statistics Components

통계 뷰에서 사용되는 세부 컴포넌트들입니다.

## Components

### WatchStressCard

워치(Health Connect) 연동 시 스트레스 데이터(HRV)를 시각화하여 보여주는 카드 컴포넌트입니다.

**위치**: 통계 탭 > 누적 탭 > 마지막 카드

**주요 기능**:
- 오늘 스트레스 레벨 배지 표시 (LOW/MEDIUM/HIGH)
- 7일/30일 기간 선택 가능
- 평균 HRV 및 추세 스파크라인 차트
- 최고/최저 HRV 정보와 날짜
- 워치 미연동 시 Empty 상태 표시

**API 연동**:
- `GET /api/watch/stress/today` - 오늘 스트레스 요약
- `GET /api/watch/stress/stats?from=YYYY-MM-DD&to=YYYY-MM-DD` - 기간별 통계

**상태 처리**:
- 로딩 상태: Skeleton UI 표시
- 에러 상태: 경고 메시지 표시
- 미연동 상태: Empty 카드 + "연동하기" 버튼

**디자인 토큰**:
모든 색상과 스타일은 기존 S:ote 디자인 시스템을 따릅니다:
- 메인 배경: `#F5F1E8`
- 메인 텍스트: `#4A3228`
- 포인트 컬러: `#7B8B4F` (LOW)
- 경고 컬러: `#F59E0B` (MEDIUM)
- 위험 컬러: `#EF4444` (HIGH)
- 보조 색상: `#E5E5E5` (테두리)

**테스트**:
```typescript
// Empty 상태 테스트: isConnected를 false로 설정
const [isConnected, setIsConnected] = useState<boolean | null>(false);

// 실제 API 연동 시: 주석 해제 및 mock 데이터 제거
// const todayResponse = await fetch('/api/watch/stress/today');
// const statsResponse = await fetch(`/api/watch/stress/stats?from=${fromStr}&to=${toStr}`);
```
