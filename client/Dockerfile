# Build stage
FROM node:18-alpine as build

# Set the working directory
WORKDIR /app/client

# Install necessary build tools
RUN apk add --no-cache python3 make g++

# Copy only package files first to leverage Docker cache
COPY client/package*.json ./

# Install dependencies with legacy peer deps and no audit, using npm ci for faster installs
RUN npm ci --legacy-peer-deps --no-audit --prefer-offline

# Copy source code
COPY client/ ./

# Build the app with production optimization
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install serve globally only when needed
RUN npm install -g serve

# Set non-root user for security reasons
RUN adduser -D -g '' appuser

# Copy built app from build stage
COPY --from=build /app/client/build /app/build

# Change ownership to the non-root user
RUN chown -R appuser:appuser /app

# Switch to the non-root user
USER appuser

# Expose port
EXPOSE 80

# Start the app
CMD ["serve", "-s", "build", "-l", "80"]
