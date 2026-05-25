#!/usr/bin/env bash
set -e

cd frontend
npm ci
npm audit --audit-level=high

# Run Jest unit tests (covers DOM assertions, config file checks, type exports)
npm test -- --watchAll=false --forceExit

echo "=== Jest unit tests passed ==="

# Build static export for HTTP integration tests
npm run build

cd ..

PORT=3099
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

SERVER_PID=""
cleanup() {
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
  lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
}
trap cleanup EXIT

# Serve the static export directory (serve.json inside it configures redirects)
npx --yes serve frontend/out/health-sdlc-playground -p $PORT --no-clipboard &
SERVER_PID=$!

# Wait up to 60 seconds for server to respond
READY=0
for i in $(seq 1 30); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "308" ]; then
    READY=1
    break
  fi
  echo "  Waiting for server (attempt $i, status: $HTTP_CODE)..."
  sleep 2
done

if [ "$READY" -eq 0 ]; then
  echo "ERROR: HTTP server did not start within 60 seconds"
  exit 1
fi

echo "=== HTTP integration tests (port $PORT) ==="

# Scenario 1: GET / => 200
STATUS_ROOT=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/")
if [ "$STATUS_ROOT" != "200" ]; then
  echo "FAIL Scenario 1: expected HTTP 200 at /, got $STATUS_ROOT"
  exit 1
fi
echo "PASS Scenario 1: GET / => 200"

# Scenario 3: GET /weekly-dashboard/ without following redirects => 308
STATUS_WD=$(curl -s -o /dev/null -w "%{http_code}" --max-redirs 0 "http://localhost:$PORT/weekly-dashboard/" 2>/dev/null || echo "000")
if [ "$STATUS_WD" != "308" ]; then
  echo "FAIL Scenario 3: expected 308 for /weekly-dashboard/, got $STATUS_WD"
  exit 1
fi
echo "PASS Scenario 3: GET /weekly-dashboard/ => 308"

# Scenario 4: following redirect from /weekly-dashboard/ lands on /
FINAL_URL=$(curl -s -o /dev/null -w "%{url_effective}" -L "http://localhost:$PORT/weekly-dashboard/" 2>/dev/null || echo "")
if ! echo "$FINAL_URL" | grep -qE "localhost:$PORT/?$"; then
  echo "FAIL Scenario 4: expected final URL to be http://localhost:$PORT/, got $FINAL_URL"
  exit 1
fi
echo "PASS Scenario 4: /weekly-dashboard/ redirect resolves to /"

# Scenario 7: unknown route => 404
STATUS_404=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/non-existent-route/" 2>/dev/null || echo "000")
if [ "$STATUS_404" != "404" ]; then
  echo "FAIL Scenario 7: expected 404 for /non-existent-route/, got $STATUS_404"
  exit 1
fi
echo "PASS Scenario 7: GET /non-existent-route/ => 404"

echo "=== All HTTP integration tests passed ==="