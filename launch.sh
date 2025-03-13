#!/usr/bin/env sh

echo "HOSTNAME=${HOSTNAME}"
echo "PORT=${PORT}"
echo "ZITADEL_API_URL: ${ZITADEL_API_URL}"
echo "ZITADEL_SERVICE_USER_ID: ${ZITADEL_SERVICE_USER_ID}"

# Write .env.local
if [ -d /app/apps/login/ ]; then
  echo "EMAIL_VERIFICATION=false" > /app/apps/login/.env.local
  echo "DEBUG=true" >> /app/apps/login/.env.local
  echo "ZITADEL_API_URL=${ZITADEL_API_URL}" >> /app/apps/login/.env.local
  echo "ZITADEL_SERVICE_USER_ID=${KAUTH_UI_SERVICE_USER}"  >> /app/apps/login/.env.local
  echo "ZITADEL_SERVICE_USER_TOKEN=\"${KAUTH_UI_SERVICE_TOKEN}\"" >> /app/apps/login/.env.local
fi

pnpm start:built -- --port=$PORT --hostname=$HOSTNAME
