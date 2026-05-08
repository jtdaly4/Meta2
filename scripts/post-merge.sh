#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push

# Sync to GitHub after every merge
if [ -n "$GITHUB_TOKEN_META2" ]; then
  echo "Syncing to GitHub..."
  git remote remove github 2>/dev/null || true
  git remote add github "https://jtdaly4:${GITHUB_TOKEN_META2}@github.com/jtdaly4/Meta2.git"
  git push github HEAD:main --force
  git remote remove github
  echo "GitHub sync complete."
else
  echo "GITHUB_TOKEN_META2 not set — skipping GitHub sync."
fi
