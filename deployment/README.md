# Deployment Guide

This guide outlines the steps to deploy the Gravity Runner game on DigitalOcean using Apache as the web server.

## Prerequisites

- DigitalOcean Droplet (Ubuntu 20.04 LTS)
- Domain names configured with DNS A records:
  - gravity.ahail.work -> 45.55.57.18
  - api.gravity.ahail.work -> 45.55.57.18

## Server Setup

1. Update system packages:
```bash
sudo apt update
sudo apt upgrade -y
```

2. Install required software:
```bash
# Install Apache
sudo apt install apache2 -y

# Install Node.js 20.x (Latest LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Verify Node.js and npm versions
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x or higher

# Install MySQL
sudo apt install mysql-server -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-apache -y
```

3. Enable required Apache modules:
```bash
sudo a2enmod ssl
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo a2enmod rewrite
sudo systemctl restart apache2
```

## Frontend Deployment

1. Create the web root directory:
```bash
sudo mkdir -p /var/www/gravity.ahail.work
sudo chown -R www-data:www-data /var/www/gravity.ahail.work
```

2. Build the frontend:
```bash
cd frontend
npm install
npm run build
```

3. Copy the built files:
```bash
sudo cp -r dist/* /var/www/gravity.ahail.work/
```

4. Configure Apache virtual host:
```bash
sudo cp deployment/apache/gravity.ahail.work.conf /etc/apache2/sites-available/
sudo a2ensite gravity.ahail.work
```

## Backend Deployment

1. Set up the backend:
```bash
cd backend
npm install
npm run build
```

2. Configure environment variables:
```bash
sudo cp .env.example .env
# Edit .env with production values
sudo nano .env
```

3. Configure Apache virtual host:
```bash
sudo cp deployment/apache/api.gravity.ahail.work.conf /etc/apache2/sites-available/
sudo a2ensite api.gravity.ahail.work
```

4. Set up PM2 for Node.js process management:
```bash
sudo npm install -g pm2
pm2 start dist/index.js --name gravity-backend
pm2 startup
pm2 save
```

## SSL Certificates

1. Generate SSL certificates:
```bash
sudo certbot --apache -d gravity.ahail.work -d api.gravity.ahail.work
```

2. Test auto-renewal:
```bash
sudo certbot renew --dry-run
```

## Final Steps

1. Restart Apache:
```bash
sudo systemctl restart apache2
```

2. Test the deployment:
- Frontend: https://gravity.ahail.work
- Backend: https://api.gravity.ahail.work

## Maintenance

- Monitor logs:
  ```bash
  # Apache logs
  sudo tail -f /var/log/apache2/gravity.ahail.work-error.log
  sudo tail -f /var/log/apache2/api.gravity.ahail.work-error.log
  
  # Backend logs
  pm2 logs gravity-backend
  ```

- Update SSL certificates:
  ```bash
  sudo certbot renew
  ```

- Restart services:
  ```bash
  sudo systemctl restart apache2
  pm2 restart gravity-backend
  ``` 