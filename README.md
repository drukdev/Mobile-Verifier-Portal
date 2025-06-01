Mobile Verifier Portal
A modern web application for mobile device verification built with React, Vite, and Tailwind CSS.

Features
React 19 with Vite for fast development

React Router for navigation

React Hook Form for form management

TanStack Table for data tables

Tailwind CSS for styling

ESLint for code quality

TypeScript support

Getting Started
Prerequisites
Node.js (version 18+ recommended)

pnpm (version 8+)

Installation
Clone the repository

Install dependencies:

bash
pnpm install
Available Scripts
pnpm start: Runs the app in development mode

pnpm build: Builds the app for production

pnpm lint: Runs ESLint to check code quality

pnpm preview: Previews the production build locally

Environment Variables
This project uses dotenv for environment variables. Create a .env file in the root directory with your configuration:

VITE_API_URL=your_api_url_here
Technologies Used
React 19

Vite

Tailwind CSS

React Router

React Hook Form

TanStack Table

Contributing
Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

License
This project is private and proprietary. All rights reserved.


If You Prefer npm/yarn (not recommended):

Remove the "packageManager" field from package.json.

Delete pnpm-lock.yaml.

Run npm install or yarn install (but dependency resolution may differ).

This project is optimized for pnpm. While you can force npm/yarn, it risks:

Broken dependencies.

Inconsistent installs across teams.

Wasted disk space.

Stick to pnpm for safety! 🚀