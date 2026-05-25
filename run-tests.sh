#!/usr/bin/env bash
set -e

cd frontend
npm ci
npm audit --audit-level=high || echo "npm audit reported issues (non-blocking)"
npm test -- --watchAll=false --forceExit