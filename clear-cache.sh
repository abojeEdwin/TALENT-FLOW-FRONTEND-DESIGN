#!/bin/bash

echo "🧹 Clearing Next.js cache..."

# Remove .next directory
if [ -d ".next" ]; then
  rm -rf .next
  echo "✅ Removed .next directory"
else
  echo "ℹ️  .next directory not found"
fi

# Remove node_modules/.cache if it exists
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "✅ Removed node_modules/.cache"
else
  echo "ℹ️  node_modules/.cache not found"
fi

echo ""
echo "✨ Cache cleared successfully!"
echo ""
echo "Now restart your dev server:"
echo "  1. Stop the current server (Ctrl+C)"
echo "  2. Run: npm run dev"
echo ""
