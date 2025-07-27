#!/bin/bash
echo "Testing TypeScript compilation..."
npx tsc --noEmit --skipLibCheck
echo "Build test complete"