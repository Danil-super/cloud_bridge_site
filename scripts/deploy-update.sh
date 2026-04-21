#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/cloud-bridge-site}"
BRANCH="${BRANCH:-main}"
SERVICE_NAME="${SERVICE_NAME:-cloud-bridge-site}"

echo "==> App dir: ${APP_DIR}"
echo "==> Branch: ${BRANCH}"
echo "==> Service: ${SERVICE_NAME}"

cd "${APP_DIR}"

echo "==> Fetching latest changes"
git fetch origin "${BRANCH}"

LOCAL_SHA="$(git rev-parse HEAD)"
REMOTE_SHA="$(git rev-parse "origin/${BRANCH}")"
BASE_SHA="$(git merge-base HEAD "origin/${BRANCH}")"

if [[ "${LOCAL_SHA}" == "${REMOTE_SHA}" ]]; then
  echo "==> Already up to date"
  exit 0
fi

if [[ "${LOCAL_SHA}" != "${BASE_SHA}" ]]; then
  echo "==> Local branch has diverged from origin/${BRANCH}"
  echo "==> Resolve manually before running deployment"
  git status --short --branch
  exit 1
fi

echo "==> Pulling latest code"
git pull --ff-only origin "${BRANCH}"

echo "==> Installing production dependencies"
npm install --omit=dev

echo "==> Restarting service"
sudo systemctl restart "${SERVICE_NAME}"

echo "==> Service status"
sudo systemctl --no-pager --full status "${SERVICE_NAME}"
