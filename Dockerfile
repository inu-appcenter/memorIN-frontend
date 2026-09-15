# ─── 1단계: 빌드 ───────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# 의존성 레이어를 소스와 분리해 캐시를 재사용한다(memorIN-backend Dockerfile과 동일 패턴).
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# web.output이 "single"(SPA)이라 이미지 하나로 모든 배포 환경(로컬/스테이징/운영)을
# 커버할 수 있다 — API 주소는 단일 호스트 + 경로 분기(nginx가 /api, /auth, /ws를
# 프록시) 구성을 전제로 비워 둔다. axios가 상대 경로를 쓰게 되어 same-origin이라
# CORS 문제도 없다. 배포 환경마다 달라지는 값(VAPID 공개키)은 빌드가 아니라
# 컨테이너 기동 시점에 /config.json으로 주입한다 (아래 40-runtime-config.sh).
ENV EXPO_PUBLIC_API_BASE_URL=""
RUN npx expo export --platform web --output-dir dist

# ─── 2단계: 실행 ───────────────────────────────────────────────
FROM nginx:stable-alpine AS runtime

# envsubst가 이미 alpine 베이스에 포함되어 있다 — 아래 엔트리포인트가
# default.conf.template을 컨테이너 기동 시 실제 conf.d 설정으로 변환한다.
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
