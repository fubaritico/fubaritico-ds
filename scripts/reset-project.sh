#!/bin/bash

# Reset project script
# Simulates a fresh clone for a new developer

set -e

echo "🧹 Cleaning project..."

# Remove all node_modules
echo "  → Removing node_modules..."
find . -name "node_modules" -type d -prune -exec rm -rf {} + 2>/dev/null || true

# Remove all dist folders
echo "  → Removing dist folders..."
find . -name "dist" -type d -prune -exec rm -rf {} + 2>/dev/null || true

# Remove the Nx cache
echo "  → Removing .nx cache..."
rm -rf .nx 2>/dev/null || true

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "📦 Building packages..."
pnpm build

echo "✅ Project reset complete!"
echo ""
echo "You can now run: pnpm dev"
