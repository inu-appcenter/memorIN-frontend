# memorIN-frontend 기여 안내

## 시작하기
- 로컬 실행은 [README의 시작하기](README.md#시작하기)를 따릅니다(Node 24, `npm ci`).
- API 서버는 memorIN-backend를 로컬에서 함께 띄웁니다.

## 브랜치
- `main`에서 브랜치를 만들어 `main`으로 PR을 올립니다.
- 브랜치 이름은 이슈에서 만든 브랜치(`112-fix-...`)나 `<type>/<요약>`을 씁니다.
- PR은 squash로 병합합니다.
- `main`은 직접 푸시, force push, 삭제가 막혀 있고, 병합된 브랜치는 자동으로 삭제됩니다.

## 커밋
- 메시지는 첫 줄 `<type>: <설명>`, 그 아래 본문에 왜 바꿨는지를 적습니다.
- 도구가 자동으로 붙이는 공동 작성자 트레일러나 세션 링크는 넣지 않습니다(커밋·본문 서명 검사가 막습니다).

## PR
- 제목: `<type>: <설명>`
  - type: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `style`
- 본문
  - 변경 사항과 검증을 적습니다.
  - 웹과 네이티브 중 어디서 확인했는지 구분해 적습니다.
  - 이슈를 닫는 PR은 `Closes #번호`를 적습니다.
- 리뷰
  - 리뷰어를 1명 이상 지정합니다.
  - 현재 병합에 필요한 승인 수는 0명입니다. <!-- 결정 필요: 승인 필수 인원 -->
- PR에서 도는 검사
  - 타입 체크(lint 포함)
  - 이미지 빌드 검증
  - PR 제목 컨벤션 검사
  - 커밋·본문 서명 검사
  - CodeQL
- 올리기 전에 로컬에서 `npm run typecheck`, `npm run lint`를 돌립니다.

## 코드 규칙
- 사용자에게 보이는 문구는 `src/shared/locales/ko/common.json`과 `en/common.json`에 함께 추가합니다.
- `docker/default.conf.template`(nginx)을 바꾸면 PR 본문에 확인한 응답 헤더와 동작을 적습니다.
  - CI는 이미지 빌드만 확인하고 nginx 설정 검사는 하지 않습니다.

## 의존성
- Dependabot이 마이너·패치 묶음 PR을 올립니다.
  - npm과 Docker는 매주 월요일 09:00(KST), GitHub Actions는 매월 올라옵니다.
  - 메이저 업데이트는 받지 않습니다.
- Expo SDK가 버전을 맞춰 고정하는 패키지는 따로 올리지 않습니다.
  - `expo`, `expo-*`, `@expo/*`는 패치만 받습니다.
  - `react`, `react-dom`, `react-native`, `react-native-*`, `@react-native/*`, `@shopify/flash-list`는 받지 않습니다.
  - SDK를 올릴 때 `npx expo install --fix`로 함께 올립니다.
- Dependabot 보안 업데이트 PR은 Expo SDK 업그레이드 전까지 꺼 두었습니다(알림은 켜 둠).
  - 그동안 `npm audit fix`(`--force` 없이)로 SDK를 유지한 채 반영합니다.

## 비밀값
- `.env`, `google-services.json`, 서명 키(`*.jks`, `*.p8`, `*.p12`)는 커밋하지 않습니다.
- `EXPO_PUBLIC_*` 값은 앱 번들에 그대로 들어가므로 비밀값을 넣지 않습니다.
- 보안 문제 제보는 [SECURITY.md](SECURITY.md)를 봅니다.
