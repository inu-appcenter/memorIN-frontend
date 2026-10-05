# memorIN

> 일상의 순간을 일자별로 기록·아카이빙하고, 이를 매개로 밀도 있는 소통을 지원하는 크로스 플랫폼 소셜 / 메신저 서비스

`memorIN`은 [Setlog](https://setlog.io)처럼 하루하루의 기록을 타임라인에 쌓아두고, 그 기록을 매개로 사람들과 실시간으로 이야기를 나눌 수 있는 서비스입니다. iOS · Android 앱과 데스크탑 웹을 **하나의 코드베이스**로 지원하며, **외부 유료 클라우드 / BaaS 없이 온프레미스 저사양 서버**에서 동작하도록 설계되었습니다. 누구나 직접 **셀프 호스팅(Self-Hosting)** 할 수 있는 오픈소스 지향 프로젝트입니다.

---

## ✨ 핵심 기능

### 일상 아카이빙

- 사진·영상·텍스트를 결합한 타임라인 기반 미디어 기록 (Setlog 데일리 뷰 형태)
- 클라이언트 사전 압축 후 **MinIO로 직접 업로드**(Presigned URL) → 백엔드 서버 부하 최소화
- 게시물별 가변 메타데이터·커스텀 태그는 PostgreSQL `JSONB` 컬럼에 저장
- 달력(Calendar) 뷰 / 세로 스크롤 타임라인 뷰
- 공개 범위 설정(전체 공개 · 친구 공개 · 나만 보기)

### 통합 메신저

- 1:1 및 그룹 채팅방
- 접속 상태: **WebSocket(STOMP / SockJS)** 실시간 메시지 처리
- 미접속 상태: 소켓 반환 후 **FCM / Web Push** 알림으로 전환
- 타임라인의 로그(Log)를 채팅방으로 바로 공유하여 대화 맥락 형성
- 채팅 내역은 비동기 저장, 커서 기반 무한 스크롤 페이징

### 유저 & 인증

- 자체 회원가입(이메일 / 학번 기반)
- **JWT** 기반 경량 인증
- 웹/앱 도메인 간 접근을 위한 CORS 정책
- 유저 검색, 친구 맺기 및 관리

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────┐
│  Client (단일 코드베이스)                       │
│  React Native (Expo) + React Native for Web   │
│  · 768px 미만 → Stack(Push) 내비게이션          │
│  · 768px 이상 → Split View(Master-Detail)      │
└───────────────┬─────────────────┬─────────────┘
        REST/JWT │   STOMP/SockJS  │ Presigned URL (직접 업로드)
                 ▼                 ▼                 ▼
┌──────────────────────────┐            ┌──────────────────┐
│ Spring Boot 3.x           │            │ MinIO            │
│ · STOMP In-Memory Broker  │            │ (S3 호환 스토리지) │
│ · Hibernate 6.x / JWT     │            └──────────────────┘
└─────────────┬─────────────┘
              ▼
┌──────────────────────────┐            ┌──────────────────┐
│ PostgreSQL 18             │            │ FCM / Web Push    │
│ · io_uring 비동기 I/O      │            │ (백그라운드 알림)  │
│ · JSONB 활용              │            └──────────────────┘
└──────────────────────────┘
```

### 반응형 레이아웃 정책

| 화면 너비                   | 내비게이션                       | 부가 정보         |
| --------------------------- | -------------------------------- | ----------------- |
| **< 768px** (모바일/세로)   | Stack — 화면을 덮으며 Push 이동  | Bottom Sheet      |
| **≥ 768px** (데스크탑/가로) | Split View — 좌우 분할 병렬 배치 | 우측 분할 창 고정 |

- 메신저: `[좌 30%] 채팅방 목록` \| `[우 70%] 채팅방 내부`
- 소셜 피드: `[좌 60%] 세로 스크롤 피드` \| `[우 40%] 댓글·반응`

---

## 🧰 기술 스택

| 영역         | 기술                                            |
| ------------ | ----------------------------------------------- |
| **Frontend** | React Native (Expo), React Native for Web       |
| **Backend**  | Spring Boot 3.5, Hibernate 6.x, Java 17         |
| **Database** | PostgreSQL 18 (`io_uring`, `JSONB`)             |
| **Storage**  | S3 호환 스토리지 (presigned URL로 직접 접근)    |
| **Realtime** | Spring STOMP In-Memory Broker + SockJS Fallback |
| **Push**     | Firebase Cloud Messaging (Web Push 포함)        |
| **Infra**    | Docker Compose, pgAdmin 4                       |

> **설계 제약:** 100% 교내 온프레미스 저사양 서버. 외부 유료 클라우드·BaaS 사용 배제. 디스크 병목 해소를 위해 클라이언트 사전 극한 압축 + 유저별 스토리지 할당량(Quota) 정책 도입.

---

## 🚀 시작하기

이 저장소에는 앱(Android, iOS)과 웹 클라이언트만 있습니다. API 서버, DB,
스토리지는 [memorIN-backend](https://github.com/inu-appcenter/memorIN-backend)
README의 시작하기를 따라 먼저 띄웁니다. 운영 배포는
[memorIN-deploy](https://github.com/inu-appcenter/memorIN-deploy)에서 합니다.

### 사전 요구사항

- Node.js 24와 npm (CI와 `Dockerfile`이 Node 24를 씁니다)
- 로컬에서 실행 중인 memorIN-backend
- Android 앱: Android Studio(Android SDK, 에뮬레이터)와 `adb`
- iOS 앱: macOS와 Xcode

### 1. 의존성 설치

```bash
npm ci
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

| 변수                           | 설명                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`     | backend 주소입니다. 로컬 backend 기본값은 `http://localhost:8080`입니다.                  |
| `EXPO_PUBLIC_VAPID_PUBLIC_KEY` | 웹 푸시를 쓸 때만 채웁니다. backend의 `WEB_PUSH_VAPID_PUBLIC_KEY`와 같은 값이어야 합니다. |

- Android 에뮬레이터에서는 앱이 주소의 `localhost`와 `127.0.0.1`을 `10.0.2.2`로
  바꿔 호스트 PC의 backend에 연결합니다(`src/shared/api/client.ts`).
- 웹 Docker 이미지는 `EXPO_PUBLIC_API_BASE_URL`을 비워서 빌드하므로, 웹이 API
  요청을 자기 주소의 `/api`, `/auth`, `/ws`로 보내고 이미지 안의 nginx가 이를
  backend로 넘깁니다. VAPID 공개키는 컨테이너 환경변수 `VAPID_PUBLIC_KEY`로
  기동할 때 넣습니다(`Dockerfile`, `docker/`).

### 3. 실행

| 명령                | 하는 일                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `npm run start`     | Expo 개발 서버를 띄웁니다. 개발 빌드(`expo-dev-client`)를 설치한 기기나 에뮬레이터에서 접속합니다.               |
| `npm run web`       | 웹으로 띄웁니다. 기본 주소는 `http://localhost:8081`입니다.                                                      |
| `npm run android`   | 기기나 에뮬레이터 연결을 기다린 뒤 `adb reverse tcp:9000 tcp:9000`을 걸고 Android 개발 빌드를 설치해 실행합니다. |
| `npm run ios`       | iOS 개발 빌드를 설치해 실행합니다.                                                                               |
| `npm run typecheck` | TypeScript 타입 검사입니다. CI가 PR마다 돌립니다.                                                                |
| `npm run lint`      | ESLint 검사입니다. CI가 PR마다 돌립니다.                                                                         |

- `npm run android`는 저장소 루트에 `google-services.json`이 있어야 빌드됩니다.
  Firebase 콘솔에서 받아 두며, `.gitignore`로 커밋이 차단됩니다(`app.json`의
  `android.googleServicesFile`).
- 로컬 backend는 업로드와 다운로드용 presigned URL을 backend
  `MINIO_PUBLIC_ENDPOINT` 기본값인 `http://localhost:9000`으로 발급합니다.
  `npm run android`가 거는 `adb reverse`는 에뮬레이터에서 이 주소가 호스트 PC의
  스토리지에 닿게 합니다.
- `npm run web`으로 띄운 웹의 API 요청이 CORS 오류(403)로 막히면 backend의
  `CORS_ALLOWED_ORIGINS`를 확인합니다. backend를 `./gradlew bootRun`으로 띄우면
  기본값에 `http://localhost:8081`이 들어 있고, docker compose로 띄우면 backend
  `.env`의 `CORS_ALLOWED_ORIGINS`에 `http://localhost:8081`을 넣어야 합니다.

---

## 📂 프로젝트 구조

| 경로                       | 내용                                                            |
| -------------------------- | --------------------------------------------------------------- |
| `src/app/`                 | expo-router 라우트. 파일 경로가 화면 경로가 됩니다              |
| `src/pages/`               | 화면 단위 컴포넌트                                              |
| `src/widgets/`             | 여러 기능을 묶은 화면 구성 블록(채팅 스레드, 달력 등)           |
| `src/features/`            | 사용자 동작 단위 기능(업로드, 검색, 푸시 등)                    |
| `src/entities/`            | 도메인별 API, 모델, UI(post, user, chatRoom 등)                 |
| `src/shared/`              | 공용 API 클라이언트, UI, 설정, 다국어 리소스, 폰트              |
| `assets/`                  | 앱 아이콘과 스플래시 이미지                                     |
| `public/sw.js`             | 웹 푸시 서비스 워커                                             |
| `docker/`                  | 웹 이미지의 nginx 설정 템플릿과 기동 스크립트                   |
| `Dockerfile`               | 웹을 `expo export`로 빌드해 nginx로 서빙하는 이미지             |
| `tools/`                   | ESLint 다국어 규칙                                              |
| `types/`                   | 타입 선언                                                       |
| `.github/workflows/ci.yml` | PR의 타입 검사, lint, 제목 검사와 main 푸시 때 GHCR 이미지 빌드 |
| `app.json`                 | Expo 설정                                                       |
| `.env.example`             | 환경 변수 예시                                                  |

---

## 👥 팀 역할 (R&R)

| 파트                     | 담당                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **Design**               | 모바일(Stack)·데스크탑(Split View) 반응형 디자인 시스템, 화면 분할 비율 가이드            |
| **Frontend**             | `react-native-web` 세팅, 화면 너비 기반 동적 라우팅, 미디어 압축 모듈, FCM·Service Worker |
| **BE 1 — 유저/인증**     | JWT 인증, 친구 도메인 API, 다중 FCM 토큰 저장·갱신                                        |
| **BE 2 — 인프라/미디어** | PG 18 `io_uring` 세팅, MinIO·Presigned URL, 스토리지 Quota                                |
| **BE 3 — 채팅/알림**     | STOMP/SockJS, In-Memory 브로커 채팅·페이징, HikariCP 튜닝                                 |
| **BE 4 — 아키텍처/리뷰** | DB 설계 검수(JSONB·스키마 보안), CORS, 소켓 세션/OOM 코드 리뷰                            |

---

## ✅ QA 점검 포인트

1. **반응형 상태 동기화** — 데스크탑 → 모바일 전환 시 우측 Detail 뷰가 Stack 최상단으로 자연스럽게 유지되는지
2. **PostgreSQL 18 권한** — `public` 스키마 권한 오류 방지를 위한 표준 DDL·`GRANT` 가이드 준수
3. **WebSocket 생명주기** — 탭 닫기/새로고침 시 인메모리 브로커 세션이 즉시 반환되는지, 누수로 인한 다운이 없는지

---

## 📌 프로젝트 상태

현재 **Sprint 0 (초기 세팅)** 단계입니다. 인프라(Docker Compose), 채팅·FCM 프로토타입, 초안 DDL이 구성되어 있으며 도메인 엔티티 정렬 및 스키마 확정 작업이 진행 중입니다.

---

## 📄 라이선스

이 저장소의 코드는 [MIT License](LICENSE)를 따릅니다.

Copyright (c) 2026 INU AppCenter

- 폰트 Pretendard는 SIL Open Font License 1.1을 따릅니다 ([OFL.txt](src/shared/assets/fonts/OFL.txt)).
- 사용 중인 서드파티 라이브러리는 각자의 라이선스를 따릅니다.
