#!/usr/bin/env bash
set -e

SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# ── Build the frontend static export ────────────────────────────────────────
cd frontend && npm install && npm run build && cd ..

# ── Kill anything already on port 3000 ──────────────────────────────────────
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# ── Serve the static export ──────────────────────────────────────────────────
npx serve frontend/out -p 3000 --no-clipboard &
SERVER_PID=$!

# ── Wait for server to be ready (up to 40 s) ────────────────────────────────
for i in $(seq 1 20); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -qE "^[2345]"; then
    echo "Server ready after ${i} attempts."
    break
  fi
  sleep 2
done

# ── Install E2E dependencies and Playwright browser ──────────────────────────
cd e2e && npm install
npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium

# ── Run all accumulated E2E feature suites ──────────────────────────────────
./node_modules/.bin/cucumber-js \
  --require-module ts-node/register \
  --require 'home-page-structure-step-1/**/*.steps.ts' \
  --require 'enforce-visual-theme/**/*.steps.ts' \
  --require 'collapsed-week-trend-summary/**/*.steps.ts' \
  --require 'top-bar-navigation-menu/**/*.steps.ts' \
  '../features/home-page-structure-step-1/**/*.feature' \
  '../features/enforce-visual-theme/**/*.feature' \
  '../features/collapsed-week-trend-summary/**/*.feature' \
  '../features/top-bar-navigation-menu/**/*.feature' \
  --format progress

cd ..