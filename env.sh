#!/bin/sh

# env.sh - Script to inject environment variables at runtime

# Create env-config.js with environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window.ENV = {
  VITE_API_BASE_URL: '${VITE_API_BASE_URL:-http://localhost:8000}',
  VITE_APP_ENV: '${VITE_APP_ENV:-production}',
  // Add other environment variables here
};
EOF

echo "Environment variables injected successfully"