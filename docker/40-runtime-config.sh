#!/bin/sh
# nginx 공식 이미지 엔트리포인트가 기동 시 /docker-entrypoint.d/*.sh를 실행 순서대로 돈다.
# 여기서는 빌드 시점에 굳지 않아야 하는 값(VAPID 공개키 등)을 담은 config.json을 만든다.
# webPushSupport.ts의 getVapidPublicKey()가 이 파일을 fetch해서 쓴다.
set -eu

html_root="/usr/share/nginx/html"
config_path="${html_root}/config.json"

if [ -d "$html_root" ]; then
  cat > "$config_path" <<EOF
{"vapidPublicKey":"${VAPID_PUBLIC_KEY:-}"}
EOF
fi
