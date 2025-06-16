A Mobile Verifier Web Portal, built with React, Vite, and Tailwind CSS.

Functional Feature:
NDI can register verifier organization and register their webhook
Verifying Organizations can creat proof request for the required attributes to be verifier
Verifying Organization can manage verifier user and verifier role


Getting Started
Prerequisites
Node.js (version 18+ recommended)

pnpm (version 8+)

Installation
Clone the repository

Install dependencies:

cd to cloned-repo
pnpm install
pnpm start: Runs the app in development mode
pnpm build: Builds the app for production
pnpm lint: Runs ESLint to check code quality
pnpm preview: Previews the production build locally

Environment Variables
This project uses dotenv for environment variables. Create a .env file in the root directory with your configuration:

VITE_AUTH_API_URL= Get it from NDI
VITE_API_BASE_URL= Get it from NDI
VITE_WEBHOOK_URL= Get it from NDI





If You Prefer npm/yarn (not recommended):

Remove the "packageManager" field from package.json.

Delete pnpm-lock.yaml.

Run npm install or yarn install (but dependency resolution may differ).

This project is optimized for pnpm. While you can force npm/yarn, it risks:

Broken dependencies.

Inconsistent installs across teams.

Wasted disk space.

Stick to pnpm for safety! 🚀


Development:
bash# Using Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Using Makefile
make dev-run

Production:
bash# Using Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Using Makefile
make prod-run
