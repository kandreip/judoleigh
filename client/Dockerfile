# Build stage
FROM node:16.20.2-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Use nginx to serve the app
FROM nginx:alpine

# Copy built files
COPY --from=0 /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
