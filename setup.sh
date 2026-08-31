#!/usr/bin/env bash
# Crembers — local setup. Run once after unzipping:  sh setup.sh
set -e

echo "→ Installing dependencies…"
npm install

echo
echo "✓ Done. Start the dev server with:"
echo "    npm run dev"
echo "  then open http://localhost:3000  (/, /hr, /de)"
