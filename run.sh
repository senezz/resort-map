#!/usr/bin/env bash
set -e

MAP_PATH="map.ascii"
BOOKINGS_PATH="bookings.json"

while [[ $# -gt 0 ]]; do
  case $1 in
    --map)      MAP_PATH="$2";      shift 2 ;;
    --bookings) BOOKINGS_PATH="$2"; shift 2 ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAP_PATH="$(cd "$SCRIPT_DIR" && cd "$(dirname "$MAP_PATH")" && pwd)/$(basename "$MAP_PATH")"
BOOKINGS_PATH="$(cd "$SCRIPT_DIR" && cd "$(dirname "$BOOKINGS_PATH")" && pwd)/$(basename "$BOOKINGS_PATH")"

export MAP_PATH
export BOOKINGS_PATH

npx concurrently \
  --names "backend,frontend" \
  --prefix-colors "cyan,magenta" \
  "npm run start --workspace=backend" \
  "npm run dev --workspace=frontend"
