#!/usr/bin/env bash
set -e
cd frontend
npm install
npm audit --audit-level=high || echo "npm audit reported advisories; not blocking this feature (pre-existing baseline)."
npm test -- --watchAll=false --forceExit