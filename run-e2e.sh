#!/usr/bin/env bash
set -e

SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# Build the frontend static export
cd frontend && npm install && npm run build && cd ..

# Kill any process already on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Serve the static export
npx serve frontend/out -p 3000 --no-clipboard &
SERVER_PID=$!

# Wait for the server to become ready (up to 40 seconds)
echo "Waiting for server to become ready on port 3000..."
for i in $(seq 1 20); do
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "000")
  if echo "$STATUS_CODE" | grep -qE "^[2345]"; then
    echo "Server ready (HTTP $STATUS_CODE)"
    break
  fi
  echo "Attempt $i: got $STATUS_CODE, retrying in 2s..."
  sleep 2
done

cd e2e && npm install
npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium

# Run all accumulated E2E feature tests
./node_modules/.bin/cucumber-js \
  --require-module ts-node/register \
  --require 'home-page-structure-step-1/**/*.steps.ts' \
  --require 'improve-weekly-aggregates-and-prepare-for-more-insights/**/*.steps.ts' \
  --require 'enforce-visual-theme/**/*.steps.ts' \
  --require 'collapsed-week-trend-summary/**/*.steps.ts' \
  --require 'icon-based-trend-indicators/**/*.steps.ts' \
  '../features/home-page-structure-step-1/**/*.feature' \
  '../features/improve-weekly-aggregates-and-prepare-for-more-insights/**/*.feature' \
  '../features/enforce-visual-theme/**/*.feature' \
  '../features/collapsed-week-trend-summary/**/*.feature' \
  '../features/icon-based-trend-indicators/**/*.feature' \
  --format progress