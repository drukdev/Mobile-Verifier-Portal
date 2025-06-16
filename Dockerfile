# Development Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for development
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose development port
EXPOSE 5173

# Set environment to development
ENV NODE_ENV=development

# Start development server with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]