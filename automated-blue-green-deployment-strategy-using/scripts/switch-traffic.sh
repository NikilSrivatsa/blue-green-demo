#!/usr/bin/env sh
set -eu

COLOR="${1:?Usage: switch-traffic.sh <blue|green>}"
NAMESPACE="${NAMESPACE:-blue-green-demo}"
APP_NAME="${APP_NAME:-blue-green-demo}"

if [ "$COLOR" != "blue" ] && [ "$COLOR" != "green" ]; then
  echo "Color must be blue or green" >&2
  exit 1
fi

kubectl -n "$NAMESPACE" patch service "$APP_NAME" \
  -p "{\"spec\":{\"selector\":{\"app\":\"${APP_NAME}\",\"color\":\"${COLOR}\"}}}"

echo "Traffic switched to ${COLOR}"
