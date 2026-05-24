#!/usr/bin/env bash
set -e

APP_DIR="frontend"
E2E_DIR="e2e"
SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    echo "[run-e2e.sh] Stopping server (PID $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "[run-e2e.sh] Installing frontend dependencies..."
cd "$APP_DIR"
npm install

echo "[run-e2e.sh] Building frontend..."
npm run build

echo "[run-e2e.sh] Starting production server on port 3000..."
npx next start -p 3000 &
SERVER_PID=$!
cd ..

echo "[run-e2e.sh] Waiting for server to be ready..."
for i in $(seq 1 20); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -qE "^[2345]"; then
    echo "[run-e2e.sh] Server is up."
    break
  fi
  echo "[run-e2e.sh] Attempt $i: server not ready, waiting 2s..."
  sleep 2
done

echo "[run-e2e.sh] Installing E2E dependencies..."
cd "$E2E_DIR"
npm install

echo "[run-e2e.sh] Running Cucumber E2E tests..."
./node_modules/.bin/cucumber-js --require-module ts-node/register --require 'scaffolding-attempt-7/**/*.steps.ts' 'scaffolding-attempt-7/**/*.feature' --format progress

echo "[run-e2e.sh] E2E tests completed."