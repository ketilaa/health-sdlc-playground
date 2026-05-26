#!/usr/bin/env bash
set -e

SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# Build the Next.js static export
cd frontend && npm install && npm run build && cd ..

# Kill anything already on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Serve the static export
npx serve frontend/out -p 3000 --no-clipboard &
SERVER_PID=$!

# Wait for server to be ready (up to 40s)
echo "Waiting for server on port 3000..."
for i in $(seq 1 20); do
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "000")
  if echo "$STATUS_CODE" | grep -qE "^[2345]"; then
    echo "Server ready (HTTP $STATUS_CODE)"
    break
  fi
  echo "  attempt $i: HTTP $STATUS_CODE, retrying in 2s..."
  sleep 2
done

# Install e2e dependencies
cd e2e && npm install

# Install Playwright browser
npx playwright install chromium --with-deps 2>/dev/null || npx playwright install chromium

# Run all accumulated E2E feature tests
./node_modules/.bin/cucumber-js \
  --require-module ts-node/register \
  --require 'home-page-structure-step-1/**/*.steps.ts' \
  '../features/home-page-structure-step-1/**/*.feature' \
  --format progress