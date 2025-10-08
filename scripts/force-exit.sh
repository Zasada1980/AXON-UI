#!/usr/bin/env bash
# Wrapper to run any command with a hard timeout and ensure clean exit.
# Usage: scripts/force-exit.sh <timeout-seconds> -- <command> [args...]
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <timeout-seconds> -- <command> [args...]" >&2
  exit 2
fi

TIMEOUT_SEC="$1"; shift
if [[ "$1" != "--" ]]; then
  echo "Error: second argument must be --" >&2
  exit 2
fi
shift

# Start command in a new process group so we can kill the whole tree
(
  set -m
  "$@" &
  cmd_pid=$!
  pgid=$(ps -o pgid= $cmd_pid | tr -d ' ')
  # Watchdog timer
  (
    sleep "$TIMEOUT_SEC"
    echo "[force-exit] Timeout ${TIMEOUT_SEC}s exceeded. Killing process group $pgid" >&2
    # Kill process group
    kill -TERM -$pgid 2>/dev/null || true
    sleep 2
    kill -KILL -$pgid 2>/dev/null || true
  ) & watchdog_pid=$!

  wait $cmd_pid 2>/dev/null || true
  # If main command finished first, stop watchdog
  kill $watchdog_pid 2>/dev/null || true
) || true

# Force non-hanging exit regardless of child state
exit 0
