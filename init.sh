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
echo "Manual follow-up: see docs/device-development-workflow.md to open the app on a device or simulator."
