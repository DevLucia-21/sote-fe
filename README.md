# S:ote Frontend - Deploy Main Backup Branch

> AI 기반 감정 분석을 활용한 개인 맞춤형 음악·챌린지 추천 일기 시스템     
> **S:ote**의 기존 배포용 `main` 상태를 보존한 백업 브랜치입니다.

---

## Branch Purpose

이 브랜치는 개인 포트폴리오용 리포지토리에서 `main` 브랜치를 최종 정리본으로 교체하기 전에,      
기존 배포용 `main` 상태를 보존하기 위해 생성한 브랜치입니다.

최신 포트폴리오 정리본이 아니라, 리팩토링 이전 배포 기준 코드를 확인하기 위한 보존용 브랜치입니다.

---

## Branch Scope

기존 팀 프로젝트에서는 `main` 브랜치가 배포 기준 브랜치로 사용되었습니다.

개인 포트폴리오 리포지토리에서는 `refactor/local` 브랜치의 최종 리팩토링 결과를 새로운 `main`으로 반영했기 때문에,       
기존 `main` 상태는 `release/deploy-main` 브랜치에 별도로 보관했습니다.

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

| Branch                | Description             |
| --------------------- | ----------------------- |
| `main`                | 포트폴리오용 최종 정리 브랜치        |
| `refactor/local`      | 리팩토링 및 최종 기능 정리 브랜치     |
| `demo/exhibition`     | 캡스톤 경진대회 전시 및 시연용 브랜치   |
| `release/deploy-main` | 기존 배포용 `main` 상태 보존 브랜치 |

---

## Note

본 브랜치는 현재 기준의 최종 개발본이 아니라, 기존 배포용 `main` 상태를 기록하기 위한 백업 브랜치입니다.

최신 포트폴리오용 코드는 `main` 브랜치를 기준으로 확인하는 것을 권장합니다.
