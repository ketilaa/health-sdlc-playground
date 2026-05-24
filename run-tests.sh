#!/usr/bin/env bash
set -e
cd frontend
npm install --no-audit --no-fund
npm test -- --watchAll=false --forceExit