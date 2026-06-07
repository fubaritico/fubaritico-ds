#!/bin/bash
# Accessibility scan (Pa11y CI) against the running Storybook.
# Usage: start a Storybook first (once an apps/storybook-* app is wired), then: ./scripts/test-a11y.sh

set -e

PORT=6006

echo "🔍 Checking if Storybook is running on :$PORT ..."
if ! nc -z localhost $PORT 2>/dev/null; then
  echo "❌ Port $PORT not responding. Start Storybook first."
  echo "   (the apps/storybook-* apps are scaffolds — wire one before running a11y)"
  exit 1
fi

echo "✅ Storybook running. Starting Pa11y scan..."
pnpm a11y

echo ""
echo "📊 To export a CSV report, run: pnpm a11y:report"
