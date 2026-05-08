#!/bin/bash
# Push the current Replit state to GitHub (jtdaly4/Meta2, main branch).
# Run this manually any time you want an on-demand sync:
#   bash scripts/sync-github.sh
set -e

if [ -z "$GITHUB_TOKEN_META2" ]; then
  echo "ERROR: GITHUB_TOKEN_META2 secret is not set." >&2
  echo "Add it in the Replit Secrets tab and re-run." >&2
  exit 1
fi

echo "Pushing to GitHub (jtdaly4/Meta2)..."
git remote remove github 2>/dev/null || true
git remote add github "https://jtdaly4:${GITHUB_TOKEN_META2}@github.com/jtdaly4/Meta2.git"
git push github HEAD:main --force
git remote remove github
echo "Done. View at: https://github.com/jtdaly4/Meta2"
