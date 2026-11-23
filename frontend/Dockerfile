
# Node.js 22
FROM node:22-alpine

# Application directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY . .

# Vite development server port
EXPOSE 5173

# Start Vite with external access enabled
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
