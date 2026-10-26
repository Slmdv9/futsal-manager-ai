#!/usr/bin/env bash
set -euo pipefail

echo "Repository: $(pwd)"

if [ ! -d node_modules ]; then
  echo "Dependencies are missing. Run: npm install"
  exit 1
fi

echo "Running baseline verification..."
npm run verify

echo "Startup command: npm start"
echo "Manual follow-up: run 'npm start' and open the app in Expo Go or a simulator."
