#!/bin/bash
echo "Testing deployment build..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found"
  exit 1
fi

echo "✓ package.json found"

# Check if vite.config.ts exists
if [ ! -f "vite.config.ts" ]; then
  echo "Error: vite.config.ts not found"
  exit 1
fi

echo "✓ vite.config.ts found"

# Check if main files exist
if [ ! -f "src/main.tsx" ]; then
  echo "Error: src/main.tsx not found"
  exit 1
fi

echo "✓ src/main.tsx found"

# Check if App.tsx exists
if [ ! -f "src/App.tsx" ]; then
  echo "Error: src/App.tsx not found"
  exit 1
fi

echo "✓ src/App.tsx found"

# Check if spark-compat exists
if [ ! -f "src/lib/spark-compat.ts" ]; then
  echo "Error: src/lib/spark-compat.ts not found"
  exit 1
fi

echo "✓ src/lib/spark-compat.ts found"

echo "All essential files are present for deployment!"
echo "Project should be ready for Vercel deployment."