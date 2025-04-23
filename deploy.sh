#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting JudoLeigh deployment...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install
cd client
npm install
npm run build
cd ..

# Install PM2 if not already installed
echo -e "${GREEN}Installing PM2...${NC}"
npm install -g pm2

# Start the backend server
echo -e "${GREEN}Starting backend server...${NC}"
cd server
npm install
pm2 start server.js --name "judoleigh-backend"
cd ..

# Create and start frontend server
echo -e "${GREEN}Creating frontend server...${NC}"
cat > frontend-server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend server running at http://localhost:${port}`);
});
EOF

# Start the frontend server
echo -e "${GREEN}Starting frontend server...${NC}"
pm2 start frontend-server.js --name "judoleigh-frontend"

# Save PM2 process list
pm2 save

echo -e "${GREEN}Deployment completed!${NC}"
echo
echo -e "${YELLOW}The application should now be running at:${NC}"
echo -e "${YELLOW}Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}Backend API: http://localhost:3001${NC}"
echo
echo -e "${YELLOW}To check the status of your servers, run: pm2 status${NC}"
echo -e "${YELLOW}To view logs, run: pm2 logs${NC}" 