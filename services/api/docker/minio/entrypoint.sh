#!/bin/sh
# Entrypoint of the local MinIO (docker-compose.yml): starts the server, then creates the
# buckets and their access rules (init-buckets.sh), then marks the container ready, which
# is what its healthcheck waits for. Done inside this container, not in a one-shot
# service, because `docker compose up --wait` (pnpm infra:up) fails when any container
# exits, even successfully.
set -eu

READY_MARK=/tmp/buckets-ready
rm -f "$READY_MARK"

minio server /data --console-address :9001 &
server=$!
# Stop the server when the container is stopped (sh, as PID 1, forwards nothing itself).
trap 'kill -TERM "$server"' TERM INT

until mc ready local >/dev/null 2>&1; do
  sleep 1
done
sh /init/init-buckets.sh
touch "$READY_MARK"

wait "$server"
