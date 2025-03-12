#!/usr/bin/env sh

echo "HOSTNAME=${HOSTNAME}"
echo "PORT=${PORT}"
echo "ZITADEL_API_URL: ${ZITADEL_API_URL}"

# Write .env.local
if [ -d /app/apps/login/ ]; then
  touch /app/apps/login/.env.local
  echo "EMAIL_VERIFICATION=false" >> /app/apps/login/.env.local
  echo "DEBUG=true" >> /app/apps/login/.env.local
  echo "ZITADEL_API_URL=${ZITADEL_API_URL}" >> /app/apps/login/.env.local
  echo "ZITADEL_SERVICE_USER_ID=${ZITADEL_SERVICE_USER_ID}"  >> /app/apps/login/.env.local
  echo "ZITADEL_SERVICE_USER_TOKEN=\"${ZITADEL_SERVICE_USER_TOKEN}\"" >> /app/apps/login/.env.local
fi

pnpm start:built -- --port=$PORT --hostname=$HOSTNAME
