#!/usr/bin/env bash
set -e

SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# ── 1. Build the static export ────────────────────────────────────────────────
echo "==> Installing frontend dependencies..."
cd frontend
npm install
echo "==> Building static export..."
npm run build
cd ..

# ── 2. Kill anything already on port 3000 ────────────────────────────────────
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# ── 3. Serve the static export ────────────────────────────────────────────────
echo "==> Serving static export on port 3000..."
npx serve frontend/out -p 3000 --no-clipboard &
SERVER_PID=$!

# ── 4. Wait for server to be ready ───────────────────────────────────────────
echo "==> Waiting for server to be ready..."
for i in $(seq 1 20); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "000")
  if echo "$HTTP_CODE" | grep -qE "^[2345]"; then
    echo "==> Server ready (HTTP $HTTP_CODE)"
    break
  fi
  echo "    Attempt $i/20 — waiting..."
  sleep 2
done

# ── 5. Install E2E dependencies and run tests ─────────────────────────────────
echo "==> Installing E2E dependencies..."
cd e2e
npm install

echo "==> Installing Playwright browsers..."
npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium

echo "==> Running Cucumber E2E tests..."
./node_modules/.bin/cucumber-js \
  --require-module ts-node/register \
  --require 'runner-dataset-with-consistent-improvement/**/*.steps.ts' \
  '../features/runner-dataset-with-consistent-improvement/**/*.feature' \
  --format progress

echo "==> E2E tests complete."