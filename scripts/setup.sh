#!/bin/bash

# Setup project script
# Installs dependencies and builds packages before launching dev server

set -e

echo "🧹 Installing project..."

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "📦 Building packages..."
pnpm build:packages

echo "✅ Project setup complete!"
echo ""
echo "You can now run: pnpm dev"
