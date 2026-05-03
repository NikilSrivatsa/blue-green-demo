#!/usr/bin/env sh
set -eu

COLOR="${1:?Usage: deploy-color.sh <blue|green> <image>}"
IMAGE="${2:?Usage: deploy-color.sh <blue|green> <image>}"
NAMESPACE="${NAMESPACE:-blue-green-demo}"
APP_NAME="${APP_NAME:-blue-green-demo}"
DEPLOYMENT="${APP_NAME}-${COLOR}"

if [ "$COLOR" != "blue" ] && [ "$COLOR" != "green" ]; then
  echo "Color must be blue or green" >&2
  exit 1
fi

kubectl -n "$NAMESPACE" set image "deployment/${DEPLOYMENT}" "app=${IMAGE}"
kubectl -n "$NAMESPACE" set env "deployment/${DEPLOYMENT}" "APP_VERSION=${IMAGE}"
kubectl -n "$NAMESPACE" rollout status "deployment/${DEPLOYMENT}" --timeout=180s
