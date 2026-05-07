# S:ote Frontend - Refactor Local Branch

> AI 기반 감정 분석을 활용한 개인 맞춤형 음악·챌린지 추천 일기 시스템     
> **S:ote**의 기능 재점검 및 로컬 실행 안정화를 위한 리팩토링 브랜치입니다.

---

## Branch Purpose

이 브랜치는 프로젝트 종료 이후 S:ote를 다시 실행하는 과정에서      
정상적으로 동작하지 않는 기능들을 점검하고 수정하기 위해 생성한 브랜치입니다.

전시 및 배포 당시의 코드를 그대로 유지하기보다,      
로컬 환경에서 주요 사용자 흐름이 다시 작동하도록 프론트엔드 구조와 API 연동 흐름을 정리했습니다.

---

## Branch Scope

## Branch Scope

리팩토링 과정에서는 다음 흐름을 중심으로 수정했습니다.

특히 API 응답 지연, 분석 미완료, 챌린지 미생성 등 비정상 상태에서도 화면이 깨지지 않도록 예외 처리 흐름을 보완했습니다.       
또한 공개 포트폴리오 리포지토리 전환을 위해 API Base URL, Firebase 설정 등 환경별 값을 환경변수 기반으로 정리했습니다.

* 일기 작성, 수정, 재작성 흐름 정리
* 감정 분석 결과 조회 및 예외 처리 개선
* 챌린지 추천, 완료, 상태 조회 흐름 정리
* 음악 LP 보상 및 보관함 화면 정리
* 감정 캘린더 및 통계 화면 정리
* FCM 알림 설정 및 환경변수 정리

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

본 브랜치는 프로젝트 종료 후 기능을 재점검하고 로컬 실행 기준으로 정리한 리팩토링 브랜치입니다.

개인 포트폴리오 리포지토리에서는 이 브랜치의 최종 수정 내용을 `main` 브랜치에 반영하여 관리합니다.
