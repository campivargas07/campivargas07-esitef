#!/usr/bin/env bash
# Dev server + ngrok tunnel; syncs AUTH_URL in apps/web/.env.local
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE="apps/web/.env.local"
PORT="${PORT:-3000}"
LOG_DIR="/tmp/esitef-dev"
mkdir -p "$LOG_DIR"

stop_dev() {
  pkill -f "next dev" 2>/dev/null || true
}

stop_all() {
  stop_dev
  pkill -f "ngrok http ${PORT}" 2>/dev/null || true
}

set_auth_url() {
  local url="$1"
  node -e "
    const fs = require('fs');
    const p = process.argv[1];
    const url = process.argv[2];
    let s = fs.readFileSync(p, 'utf8');
    if (/^AUTH_URL=.*/m.test(s)) s = s.replace(/^AUTH_URL=.*/m, 'AUTH_URL=' + url);
    else s += '\nAUTH_URL=' + url + '\n';
    if (/^AUTH_TRUST_HOST=.*/m.test(s)) s = s.replace(/^AUTH_TRUST_HOST=.*/m, 'AUTH_TRUST_HOST=true');
    else s += 'AUTH_TRUST_HOST=true\n';
    fs.writeFileSync(p, s);
  " "$ENV_FILE" "$url"
}

wait_for_port() {
  for _ in $(seq 1 45); do
    if curl -sf "http://127.0.0.1:${PORT}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  echo "Timeout esperando http://127.0.0.1:${PORT}" >&2
  return 1
}

get_ngrok_url() {
  for _ in $(seq 1 30); do
    local json
    json=$(curl -sf "http://127.0.0.1:4040/api/tunnels" 2>/dev/null || true)
    if [ -n "$json" ]; then
      local url
      url=$(node -e "
        try {
          const t = JSON.parse(process.argv[1]).tunnels || [];
          const hit = t.find(x => x.public_url && x.public_url.startsWith('https://'));
          if (hit) process.stdout.write(hit.public_url);
        } catch {}
      " "$json")
      if [ -n "$url" ]; then
        echo "$url"
        return 0
      fi
    fi
    sleep 1
  done
  return 1
}

if [ ! -f "$ENV_FILE" ]; then
  echo "Falta $ENV_FILE — copia .env.example" >&2
  exit 1
fi

echo "→ Deteniendo procesos previos…"
stop_all
sleep 1

echo "→ Arrancando Next.js (puerto ${PORT})…"
npm run dev >"$LOG_DIR/next.log" 2>&1 &
wait_for_port

echo "→ Arrancando ngrok…"
ngrok http "$PORT" --log=stdout >"$LOG_DIR/ngrok.log" 2>&1 &

NGROK_URL=$(get_ngrok_url) || {
  echo "No se pudo obtener URL de ngrok. Revisa: tail -f $LOG_DIR/ngrok.log" >&2
  exit 1
}

if [ -z "$NGROK_URL" ]; then
  echo "URL de ngrok vacía. Revisa: tail -f $LOG_DIR/ngrok.log" >&2
  exit 1
fi

echo "→ AUTH_URL=$NGROK_URL"
set_auth_url "$NGROK_URL"

echo "→ Reiniciando Next.js con AUTH_URL actualizado…"
stop_dev
sleep 1
npm run dev >"$LOG_DIR/next.log" 2>&1 &
wait_for_port

echo ""
echo "════════════════════════════════════════"
echo "  Local:  http://localhost:${PORT}"
echo "  Ngrok:  ${NGROK_URL}"
echo "  Admin:  ${NGROK_URL}/admin/libros"
echo "  Login:  admin@esitef.com / demo1234"
echo "  Logs:   tail -f $LOG_DIR/next.log"
echo "          tail -f $LOG_DIR/ngrok.log"
echo "════════════════════════════════════════"
