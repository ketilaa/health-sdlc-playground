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

# Kill anything already on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Serve the static export
npx serve frontend/out -p 3000 --no-clipboard &
SERVER_PID=$!

# Wait for server to be ready (up to 40 seconds)
echo "Waiting for server to be ready..."
for i in $(seq 1 20); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "000")
  if echo "$STATUS" | grep -qE "^[2345]"; then
    echo "Server ready (HTTP $STATUS)"
    break
  fi
  echo "  attempt $i/20: HTTP $STATUS — retrying in 2s"
  sleep 2
done

# Install E2E dependencies and run tests
cd e2e && npm install
npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium

./node_modules/.bin/cucumber-js \
  --require-module ts-node/register \
  --require 'home-page-structure-step-1/**/*.steps.ts' \
  --require 'improve-weekly-aggregates-and-prepare-for-more-insights/**/*.steps.ts' \
  --require 'enforce-visual-theme/**/*.steps.ts' \
  '../features/home-page-structure-step-1/**/*.feature' \
  '../features/improve-weekly-aggregates-and-prepare-for-more-insights/**/*.feature' \
  '../features/enforce-visual-theme/**/*.feature' \
  --format progress