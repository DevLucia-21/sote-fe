# S:ote Frontend - Exhibition Demo Branch

> AI 기반 감정 분석을 활용한 개인 맞춤형 음악·챌린지 추천 일기 시스템     
> **S:ote**의 캡스톤 경진대회 전시 및 시연용 프론트엔드 브랜치입니다.

---

## Branch Purpose

이 브랜치는 2025 캡스톤 경진대회 전시 환경에서 서비스를 안정적으로 시연하기 위해 구성한 데모용 브랜치입니다.

해당 전시에서 S:ote는 **아리상**을 수상했으며,      
본 브랜치는 당시 주요 사용자 흐름과 핵심 기능을 시연하기 위해 사용되었습니다.

실제 운영 또는 포트폴리오 최종 정리본이 아니라,      
전시 현장에서 주요 화면 흐름과 핵심 기능을 빠르게 보여주기 위한 버전입니다.

---

## Branch Scope

전시 시연을 위해 다음 흐름을 중심으로 구성했습니다.

* 일기 작성 및 감정 분석 결과 확인
* 감정 기반 챌린지 추천 화면
* 음악 LP 보관함 화면
* 감정 캘린더 및 통계 화면
* 사용자 설정 및 알림 관련 화면

---

## Tech Stack

| Category              | Stack                                |
| --------------------- | ------------------------------------ |
| Frontend              | React, TypeScript, Vite              |
| UI                    | Tailwind CSS, Radix UI, lucide-react |
| State / API           | React Hooks, Axios                   |
| Notification          | Firebase Cloud Messaging             |
| Chart / Visualization | Recharts                             |

---

## Running the Project

```bash
npm install
npm run dev
```

로컬 실행 시 환경변수 파일이 필요합니다.

```text
.env
.env.example
```

공개 저장소에는 실제 API Base URL, Firebase 설정값 등 환경별 설정값을 포함하지 않습니다.      
환경변수 구성 예시는 `.env.example` 파일을 참고합니다.

---

## Branch Guide

| Branch                | Description           |
| --------------------- | --------------------- |
| `main`                | 포트폴리오용 최종 정리 브랜치      |
| `demo/exhibition`     | 캡스톤 경진대회 전시 및 시연용 브랜치 |
| `refactor/local`      | 리팩토링 및 최종 기능 정리 브랜치   |
| `release/deploy-main` | 기존 배포용 main 상태 보존 브랜치 |

---

## Note

본 브랜치는 전시 시연 목적에 맞춰 구성된 버전이므로,       
최신 포트폴리오 정리본은 `main` 브랜치를 기준으로 확인하는 것을 권장합니다.
