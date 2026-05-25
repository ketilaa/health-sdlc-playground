#!/usr/bin/env bash
set -e

cd frontend
npm ci
npm audit --audit-level=high
npm test -- --watchAll=false --forceExit