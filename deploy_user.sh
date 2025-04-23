#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print status messages
print_status() {
    echo -e "${GREEN}[*] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

print_error() {
    echo -e "${RED}[x] $1${NC}"
}

# Create application directory in user's home
print_status "Setting up application directory..."
mkdir -p ~/judoleigh
cd ~/judoleigh

# Clone the repository
print_status "Cloning repository..."
git clone https://github.com/yourusername/judoleigh.git .

# Install dependencies
print_status "Installing dependencies..."
npm run install-all

# Build the React application
print_status "Building React application..."
npm run build

# Install PM2 locally
print_status "Installing PM2 locally..."
npm install pm2 --save

# Start the backend server
print_status "Starting backend server..."
cd ~/judoleigh/server
npx pm2 start server.js --name "judoleigh-backend"

# Save PM2 process list
npx pm2 save

# Set up PM2 to start on boot (user-level)
npx pm2 startup

# Create a simple Node.js server to serve the frontend
print_status "Creating frontend server..."
cat > ~/judoleigh/server/frontend-server.js << EOF
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(\`Frontend server running at http://localhost:\${port}\`);
});
EOF

# Start the frontend server
print_status "Starting frontend server..."
cd ~/judoleigh/server
npx pm2 start frontend-server.js --name "judoleigh-frontend"

# Save PM2 process list again
npx pm2 save

print_status "Deployment completed successfully!"
print_warning "IMPORTANT: Please verify the following:"
print_warning "1. Both servers are running: npx pm2 status"
print_warning "2. Application is accessible at http://localhost:3000"
print_warning "3. API is accessible at http://localhost:3001"

# Display PM2 status
npx pm2 status 