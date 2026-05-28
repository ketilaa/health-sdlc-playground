#!/usr/bin/env bash
set -e
cd frontend
npm ci
npm audit --audit-level=high
npx tsc --noEmit
npm test -- --watchAll=false --forceExit