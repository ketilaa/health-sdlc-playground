#!/usr/bin/env bash
set -e
cd frontend
npm ci
npm audit --audit-level=high
npm run build
npm test -- --watchAll=false --forceExit