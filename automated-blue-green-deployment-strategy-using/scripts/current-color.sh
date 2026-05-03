#!/usr/bin/env sh
set -eu

NAMESPACE="${NAMESPACE:-blue-green-demo}"
APP_NAME="${APP_NAME:-blue-green-demo}"

kubectl -n "$NAMESPACE" get service "$APP_NAME" -o jsonpath='{.spec.selector.color}'
printf '\n'
