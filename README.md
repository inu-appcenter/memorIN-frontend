# memorIN-frontend

> 일상의 순간을 날짜별로 기록하고, 그 기록을 매개로 소통하는 크로스 플랫폼 소셜·메신저 서비스 memorIN의 클라이언트

React Native(Expo)와 React Native for Web으로 iOS·Android 앱과 웹을 하나의 코드베이스로 만듭니다. 서비스 소개와 전체 아키텍처는 [memorIN-backend](https://github.com/inu-appcenter/memorIN-backend) README에 있습니다.

## 화면 구성

| 화면 너비 | 내비게이션 | 부가 정보 |
| --- | --- | --- |
| 768px 미만 | Stack(화면을 덮으며 이동) | Bottom Sheet |
| 768px 이상 | Split View(좌우 분할) | 우측 분할 창 |

- 메신저: 채팅방 목록(30%) | 채팅방(70%)
- 피드: 피드(60%) | 댓글·반응(40%)

## 시작하기

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

## 프로젝트 구조

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
| `.github/workflows/ci.yml` | PR의 타입 검사, lint, 제목 검사, 이미지 빌드 검증과 main 푸시 때 GHCR 이미지 푸시 |
| `app.json`                 | Expo 설정                                                       |
| `.env.example`             | 환경 변수 예시                                                  |

## 기여

- `main`에서 브랜치를 만들어 `main`으로 PR을 올리고, squash로 머지합니다.
- PR 제목은 `<type>: <설명>` 형식입니다(`feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`, `perf`). CI가 제목, 타입 검사, lint, 이미지 빌드를 확인합니다.

## 라이선스

이 저장소의 코드는 [MIT License](LICENSE)를 따릅니다.

Copyright (c) 2026 INU AppCenter

- 폰트 Pretendard는 SIL Open Font License 1.1을 따릅니다 ([OFL.txt](src/shared/assets/fonts/OFL.txt)).
- 사용 중인 서드파티 라이브러리는 각자의 라이선스를 따릅니다.
