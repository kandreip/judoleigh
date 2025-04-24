# Build stage
FROM node:16.20.2-alpine as build

# Set the working directory
WORKDIR /app/client

# Install necessary build tools and yarn
RUN apk add --no-cache python3 make g++ git && \
    npm install -g yarn

# Copy only package files first to leverage Docker cache
COPY client/package*.json ./

# Install dependencies using yarn
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy source code
COPY client/ ./

# Build the app with production optimization
ENV NODE_ENV=production
RUN yarn build

# Production stage
FROM node:16.20.2-alpine

# Set working directory
WORKDIR /app

# Install serve globally
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
