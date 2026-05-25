#!/usr/bin/env bash
set -e
cd frontend
npm install
npm audit --audit-level=high || echo "npm audit reported issues (non-blocking for known transitive issues)"
npm test -- --watchAll=false --forceExit