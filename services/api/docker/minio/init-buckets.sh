#!/bin/sh
# Run by entrypoint.sh on every start of the local MinIO (docker-compose.yml), and safe to
# repeat: creates the development and e2e buckets if missing, then (re)applies their
# access rules. MC_HOST_local (set by docker-compose.yml) points mc at the server.
#
# - jazla-public, jazla-public-test: anonymous GET of objects only (s3:GetObject). mc's
#   `download` preset would also let anyone list every key, pending uploads included.
# - jazla-private, jazla-private-test: no anonymous access; read through presigned URLs.
# CORS is not set here: MinIO does not implement per-bucket CORS (PutBucketCors answers
# NotImplemented); MINIO_API_CORS_ALLOW_ORIGIN in docker-compose.yml sets it for the server.
set -eu

for suffix in "" "-test"; do
  public="jazla-public${suffix}"
  private="jazla-private${suffix}"
  mc mb --ignore-existing "local/$public" "local/$private"

  policy='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},'
  policy="$policy"'"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::'"$public"'/*"]}]}'
  printf '%s' "$policy" > /tmp/public-read.json
  mc anonymous set-json /tmp/public-read.json "local/$public"

  mc anonymous set none "local/$private"
done
echo "minio-init: buckets ready"
