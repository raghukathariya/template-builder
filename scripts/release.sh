#!/usr/bin/env bash
# Bumps packages/editor-sdk's version, commits it, tags it, and pushes both.
#
# Doesn't use `npm version`'s own git integration: that only auto-commits/tags when package.json
# sits at the git repo root, and silently no-ops (still exits 0) when run against a package in a
# subdirectory like packages/editor-sdk — so the commit/tag/push here are done explicitly instead.
#
# Usage: pnpm release [patch|minor|major|<specific-version>]  (defaults to patch)
set -euo pipefail

BUMP="${1:-patch}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_DIR="$ROOT_DIR/packages/editor-sdk"
PKG_JSON="$PKG_DIR/package.json"

if [[ -n "$(git -C "$ROOT_DIR" status --porcelain)" ]]; then
  echo "error: working tree not clean — commit or stash changes first." >&2
  exit 1
fi

NEW_VERSION="$(cd "$PKG_DIR" && npm version "$BUMP" --no-git-tag-version | tr -d 'v')"
TAG="v$NEW_VERSION"

git -C "$ROOT_DIR" add "$PKG_JSON"
git -C "$ROOT_DIR" commit -m "chore(release): editor-sdk $TAG"
git -C "$ROOT_DIR" tag -a "$TAG" -m "editor-sdk $TAG"
git -C "$ROOT_DIR" push origin HEAD --follow-tags

echo ""
echo "Tagged and pushed $TAG. To publish to npm:"
echo "  cd packages/editor-sdk && pnpm publish"
