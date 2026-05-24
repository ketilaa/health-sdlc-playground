#!/usr/bin/env bash
set -e
cd frontend
npm install
npm test -- --watchAll=false --forceExit