#!/usr/bin/env sh

echo "HOSTNAME=${HOSTNAME}"
echo "PORT=${PORT}"
echo "ZITADEL_API_URL: ${ZITADEL_API_URL}"

pnpm start:built -- --port=$PORT --hostname=$HOSTNAME
