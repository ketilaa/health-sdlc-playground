#!/usr/bin/env bash
set -e

# ── Build the Next.js application ──────────────────────────────────────────
cd frontend
npm install
npm run build
cd ..

# ── Start the Next.js production server on port 3000 ───────────────────────
cd frontend
PORT=3000 npm start &
SERVER_PID=$!
cd ..

# ── Ensure the server is stopped on exit ───────────────────────────────────
trap "kill $SERVER_PID 2>/dev/null || true" EXIT

# ── Wait for the server to be ready (up to 30 s) ───────────────────────────
echo "Waiting for server to be ready..."
ATTEMPTS=0
MAX_ATTEMPTS=30
until curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/" | grep -qE "^(200|404)$"; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
    echo "Server did not become ready in time."
    exit 1
  fi
  sleep 1
done
echo "Server is ready."

# ── Run Cucumber + Playwright E2E tests ────────────────────────────────────
cd e2e
npm install
./node_modules/.bin/cucumber-js --config cucumber.json