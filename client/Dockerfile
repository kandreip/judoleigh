# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install necessary build tools
RUN apk add --no-cache python3 make g++

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies and build tools in a single layer
RUN npm install --verbose && \
    npm install -g serve

# Copy the rest of the application code to the container
COPY . .

# Build the React app with verbose output
RUN npm run build --verbose

# Expose the port the app runs on
EXPOSE 80

# Command to run the app
CMD ["serve", "-s", "build", "-l", "80"]
