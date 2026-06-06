#!/bin/bash
# Test accessibility on all running apps
# Usage: ./scripts/test-a11y.sh

set -e

echo "🔍 Checking if apps are running..."
for port in 3000 3001 3002; do
  if ! nc -z localhost $port 2>/dev/null; then
    echo "❌ Port $port not responding. Start apps with: pnpm dev"
    exit 1
  fi
done

echo "✅ All apps running. Starting Pa11y scan..."
pnpm a11y

echo ""
echo "📊 To export CSV report, run: pnpm a11y:report"
