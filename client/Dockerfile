# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Install react-scripts globally
RUN npm install -g react-scripts

# Copy the rest of the application code to the container
COPY . .

# Build the React app
RUN npm run build

# Install serve to run the production build
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 80

# Command to run the app
CMD ["serve", "-s", "build", "-l", "80"]
