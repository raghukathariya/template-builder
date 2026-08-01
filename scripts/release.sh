#!/usr/bin/env bash
# Bumps packages/editor-sdk's version, commits it, tags it, and pushes both — the same
# bump-commit-tag-push flow `npm version` gives you in a single-package repo, adapted for this
# monorepo (npm version only touches the package.json it's run against, so it's run from inside
# packages/editor-sdk rather than the workspace root).
#
# Usage: pnpm release [patch|minor|major|<specific-version>]  (defaults to patch)
set -euo pipefail

BUMP="${1:-patch}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_DIR="$ROOT_DIR/packages/editor-sdk"

if [[ -n "$(git -C "$ROOT_DIR" status --porcelain)" ]]; then
  echo "error: working tree not clean — commit or stash changes first." >&2
  exit 1
fi

NEW_VERSION="$(cd "$PKG_DIR" && npm version "$BUMP" -m "chore(release): editor-sdk v%s" | tr -d 'v')"

git -C "$ROOT_DIR" push origin HEAD --follow-tags

echo ""
echo "Tagged and pushed v$NEW_VERSION. To publish to npm:"
echo "  cd packages/editor-sdk && pnpm publish"
