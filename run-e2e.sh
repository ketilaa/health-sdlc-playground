#!/usr/bin/env bash
set -e

APP_PORT=3000

# ── 1. Install frontend dependencies and build ────────────────────────────────
echo "[run-e2e] Installing frontend dependencies..."
cd frontend
npm install
echo "[run-e2e] Building frontend..."
npm run build
cd ..

# ── 2. Start static file server ───────────────────────────────────────────────
echo "[run-e2e] Starting static server on port ${APP_PORT}..."
npx serve frontend/out -p "${APP_PORT}" --no-clipboard &
SERVER_PID=$!
trap "echo '[run-e2e] Stopping server (PID ${SERVER_PID})...'; kill ${SERVER_PID} 2>/dev/null || true" EXIT

# ── 3. Wait for server to be ready ────────────────────────────────────────────
echo "[run-e2e] Waiting for server to be ready..."
for i in $(seq 1 20); do
  if curl -s -o /dev/null "http://localhost:${APP_PORT}/"; then
    echo "[run-e2e] Server is ready."
    break
  fi
  if [ "$i" -eq 20 ]; then
    echo "[run-e2e] Server did not start in time." >&2
    exit 1
  fi
  sleep 1
done

# ── 4. Run E2E tests ──────────────────────────────────────────────────────────
echo "[run-e2e] Running E2E tests..."
cd e2e
npm install
export APP_URL="http://localhost:${APP_PORT}"
./node_modules/.bin/cucumber-js --require-module ts-node/register --require 'scaffolding-attempt-6/**/*.steps.ts' 'scaffolding-attempt-6/**/*.feature' ../features/scaffolding-attempt-6/scaffolding-attempt-6.feature

echo "[run-e2e] All tests passed."