#!/usr/bin/env bash
set -e

SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
  # Also clean up any stray process on port 3000
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
}
trap cleanup EXIT

# ---------------------------------------------------------------------------
# Build the frontend
# ---------------------------------------------------------------------------
echo "==> Installing frontend dependencies..."
cd frontend && npm install

echo "==> Building frontend (static export)..."
npm run build
cd ..

# ---------------------------------------------------------------------------
# Kill anything already on port 3000
# ---------------------------------------------------------------------------
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

# ---------------------------------------------------------------------------
# Start static file server
# ---------------------------------------------------------------------------
echo "==> Starting static file server on port 3000..."
npx serve frontend/out -p 3000 --no-clipboard &
SERVER_PID=$!

# ---------------------------------------------------------------------------
# Wait for server to be ready (up to 40 seconds)
# ---------------------------------------------------------------------------
echo "==> Waiting for server to be ready..."
READY=0
for i in $(seq 1 20); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "000")
  if echo "$HTTP_CODE" | grep -qE "^[2345]"; then
    echo "    Server ready (HTTP $HTTP_CODE) after $i attempt(s)"
    READY=1
    break
  fi
  echo "    Attempt $i: HTTP $HTTP_CODE — waiting..."
  sleep 2
done

if [ "$READY" -eq 0 ]; then
  echo "ERROR: Server did not become ready in time"
  exit 1
fi

# ---------------------------------------------------------------------------
# Install E2E dependencies and run tests
# ---------------------------------------------------------------------------
echo "==> Installing E2E dependencies..."
cd e2e && npm install

echo "==> Installing Playwright browsers..."
npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium

echo "==> Running E2E tests..."
./node_modules/.bin/cucumber-js \
  --require-module ts-node/register \
  --require 'make-weekly-dashboard-the-home-page/**/*.steps.ts' \
  '../features/make-weekly-dashboard-the-home-page/**/*.feature' \
  --format progress

echo "==> E2E tests complete."