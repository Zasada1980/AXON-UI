#!/usr/bin/env bash

# Strict mode (not strictly necessary since we exit 1 anyway)
set -uo pipefail

# Unset GitHub auth-related env vars in this process
unset GITHUB_TOKEN || true
unset GH_TOKEN || true

echo "CLEARED_ENV"

# For visibility: show that variables are now empty in this process
if [[ -n "${GITHUB_TOKEN-}" || -n "${GH_TOKEN-}" ]]; then
  echo "WARN: Variables still set in parent shell; run 'unset GITHUB_TOKEN GH_TOKEN' in the same shell to clear globally." >&2
fi

# Hard exit regardless of previous command results
exit 1
