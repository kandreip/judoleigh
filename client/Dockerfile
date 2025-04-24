# Build stage
FROM node:16.20.2-slim as build

# Set the working directory
WORKDIR /app

# Install only essential build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies with specific flags
RUN npm install --legacy-peer-deps --no-audit && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the app
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM node:16.20.2-slim

# Set working directory
WORKDIR /app

# Install serve
RUN npm install -g serve

# Create non-root user
RUN useradd -m appuser

# Copy built app from build stage
COPY --from=build /app/build /app/build

# Set permissions
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 80

# Start the app
CMD ["serve", "-s", "build", "-l", "80"]
