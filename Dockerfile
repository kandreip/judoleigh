# Step 1: Build the React app
FROM node:16 AS build

WORKDIR /app

# Copy dependencies and install
COPY package.json package-lock.json ./
RUN npm install

# Copy app source and build it
COPY . ./
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Copy built React app to Nginx default public folder
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx config for SPA support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
