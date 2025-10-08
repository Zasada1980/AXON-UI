#!/usr/bin/env bash

# Force non-zero exit at the end regardless of the command result.
# Usage:
#   bash scripts/hard-exit.sh -- "git add -A && git commit -m 'msg' && git push"

set -uo pipefail

if [[ $# -eq 0 ]]; then
  echo "Usage: $0 -- <command>" >&2
  exit 1
fi

if [[ "$1" == "--" ]]; then
  shift
fi

CMD="$*"
if [[ -z "$CMD" ]]; then
  echo "ERROR: empty command" >&2
  exit 1
fi

# Run command in a login-compatible shell to support &&, quotes, etc.
bash -lc "$CMD"
CODE=$?
echo "COMMAND_EXIT_CODE:$CODE"

# Always exit 1 (hard exit)
exit 1
