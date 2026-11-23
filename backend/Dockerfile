
# Node.js 22
FROM node:22-alpine

# Application directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy backend source code
COPY . .

# Use non-root user
USER node

# Backend port
EXPOSE 5050

# Start development server
CMD ["npm", "run", "dev"]
