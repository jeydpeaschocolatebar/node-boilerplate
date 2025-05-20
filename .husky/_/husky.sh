#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint-staged # Or pnpm run lint-staged if using pnpm
