# Build stage
FROM node:18-alpine as build

# Set the working directory
WORKDIR /app/client

# Install necessary build tools
RUN apk add --no-cache python3 make g++

# Copy only package files first to leverage Docker cache
COPY client/package*.json ./

# Install dependencies with legacy peer deps and no audit
RUN npm install --legacy-peer-deps --no-audit --prefer-offline

# Copy source code
COPY client/ ./

# Build the app with production optimization
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM node:18-alpine

# Install serve globally
RUN npm install -g serve

# Copy built app from build stage
COPY --from=build /app/client/build /app/build

# Set working directory
WORKDIR /app

# Expose port
EXPOSE 80

# Start the app
CMD ["serve", "-s", "build", "-l", "80"]
