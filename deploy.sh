#!/bin/bash

# Exit on error
set -e

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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root"
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
print_status "Installing required packages..."
apt-get install -y nginx nodejs npm git mysql-server ufw certbot python3-certbot-nginx

# Configure firewall
print_status "Configuring firewall..."
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Secure MySQL installation
print_status "Securing MySQL installation..."
mysql_secure_installation

# Create database and user
print_status "Setting up MySQL database..."
mysql -e "CREATE DATABASE IF NOT EXISTS judoleigh;"
mysql -e "CREATE USER IF NOT EXISTS 'judoleigh_user'@'localhost' IDENTIFIED BY 'Romania1989!';"
mysql -e "GRANT ALL PRIVILEGES ON judoleigh.* TO 'judoleigh_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Create application directory
print_status "Setting up application directory..."
mkdir -p /var/www/judoleigh
chown -R $SUDO_USER:$SUDO_USER /var/www/judoleigh

# Clone the repository
print_status "Cloning repository..."
cd /var/www/judoleigh
git clone <your-repository-url> .

# Install dependencies
print_status "Installing dependencies..."
npm run install-all

# Build the React application
print_status "Building React application..."
npm run build

# Configure Nginx
print_status "Configuring Nginx..."
cat > /etc/nginx/sites-available/judoleigh << EOF
server {
    listen 80;
    217.154.63.245 ao-tech.co.uk;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$217.154.63.245\$request_uri;
}

server {
    listen 443 ssl http2;
    217.154.63.245 ao-tech.co.uk;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/ao-tech.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ao-tech.co.uk/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # modern configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS (uncomment if you're sure)
    # add_header Strict-Transport-Security "max-age=63072000" always;

    root /var/www/judoleigh/client/build;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Deny access to . files
    location ~ /\. {
        deny all;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# Install Certbot for SSL certificates
print_status "Installing Certbot for SSL certificates..."
apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
print_status "Obtaining SSL certificate..."
certbot --nginx -d ao-tech.co.uk --non-interactive --agree-tos --email andreicozma89@yahoo.com

# Enable the site
ln -sf /etc/nginx/sites-available/judoleigh /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Install PM2
print_status "Installing PM2..."
npm install -g pm2

# Start the backend server
print_status "Starting backend server..."
cd /var/www/judoleigh/server
pm2 start server.js --name "judoleigh-backend"

# Save PM2 process list
pm2 save

# Set up PM2 to start on boot
pm2 startup

# Set up automatic MySQL backups
print_status "Setting up automated backups..."
mkdir -p /var/backups/mysql
cat > /etc/cron.daily/mysqlbackup << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/mysql"
DATE=\$(date +%Y%m%d)
BACKUP_FILE="\$BACKUP_DIR/judoleigh_\$DATE.sql.gz"

# Create backup
mysqldump -u judoleigh_user -p'your_secure_password' judoleigh | gzip > \$BACKUP_FILE

# Remove backups older than 30 days
find \$BACKUP_DIR -type f -mtime +30 -delete

# Log backup creation
echo "Backup created: \$BACKUP_FILE" >> /var/log/mysql-backup.log
EOF

chmod +x /etc/cron.daily/mysqlbackup

# Set up log rotation
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/judoleigh << EOF
/var/www/judoleigh/server/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Set proper permissions
print_status "Setting proper permissions..."
chown -R www-data:www-data /var/www/judoleigh
find /var/www/judoleigh -type d -exec chmod 755 {} \;
find /var/www/judoleigh -type f -exec chmod 644 {} \;

print_status "Deployment completed successfully!"
print_warning "IMPORTANT: Please update the following:"
print_warning "1. MySQL credentials in /var/www/judoleigh/server/.env.production"
print_warning "2. Domain name in /etc/nginx/sites-available/judoleigh"
print_warning "3. Repository URL in the deployment script"
print_warning "4. MySQL backup script password in /etc/cron.daily/mysqlbackup"

# Check application status
pm2 status

# View logs
pm2 logs judoleigh-backend

# Check Nginx status
systemctl status nginx

# Check MySQL status
systemctl status mysql

# Check backup logs
cat /var/log/mysql-backup.log

# List backups
ls -lh /var/backups/mysql

# Check Nginx configuration
sudo nginx -t

# Check SSL certificate
sudo certbot certificates

# Check if ports are open
sudo ufw status

sudo ufw allow 443/tcp
sudo ufw allow 80/tcp

# Test SSL configuration
curl -I https://your_domain.com

# Check SSL certificate details
openssl s_client -connect your_domain.com:443 -servername your_domain.com

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check SSL certificate status
sudo netstat -tulpn | grep 443

# Check if ports are open
sudo ufw status

sudo ufw allow 443/tcp
sudo ufw allow 80/tcp

# Test SSL configuration
curl -I https://your_domain.com

# Check SSL certificate details
openssl s_client -connect your_domain.com:443 -servername your_domain.com

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

sudo rm /etc/nginx/sites-enabled/judoleigh
sudo rm /etc/nginx/sites-available/judoleigh

sudo systemctl restart nginx 