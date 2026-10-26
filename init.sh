#!/usr/bin/env bash
set -euo pipefail

echo "Repository: $(pwd)"
echo "Harness status: pre-bootstrap"
echo "Application stack is not initialized yet."
echo "Blocking decision: stack, Board Data schema, and seed content licensing (see docs/risks-and-open-questions.md)."
echo "Next step: pick the first ready feature in feature_list.json (bootstrap-app-shell) and perform technical bootstrap."
echo "Expected future commands: to be recorded here after bootstrap (install, verify, start)."
