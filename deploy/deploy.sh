#!/bin/bash
set -euo pipefail

# SalesFunnel Deployment Script
# Usage: ./deploy.sh

APP_DIR="/opt/salesfunnel"
FRONTEND_DIR="/var/www/termin.demo-itw.de"
REPO_URL="git@github.com:mariopustan/termin.git"
BRANCH="main"

echo "=== SalesFunnel Deployment ==="
echo ""

# 1. Clone or pull repository
if [ -d "$APP_DIR" ]; then
    echo "[1/6] Pulling latest changes..."
    cd "$APP_DIR"
    git pull origin "$BRANCH"
else
    echo "[1/6] Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# 2. Build Angular frontend
echo "[2/6] Building Angular frontend..."
cd "$APP_DIR/frontend"
npm ci
npx ng build --configuration=production

# 3. Deploy frontend to web root
echo "[3/6] Deploying frontend to $FRONTEND_DIR..."
mkdir -p "$FRONTEND_DIR"
rm -rf "${FRONTEND_DIR:?}"/*
cp -r "$APP_DIR/frontend/dist/frontend/browser/"* "$FRONTEND_DIR/"
chown -R www-data:www-data "$FRONTEND_DIR"

# 4. Setup Nginx config
echo "[4/6] Setting up Nginx configuration..."
cp "$APP_DIR/deploy/nginx/security-headers-termin.conf" /etc/nginx/snippets/security-headers-termin.conf
cp "$APP_DIR/deploy/nginx/termin.demo-itw.de" /etc/nginx/sites-available/termin.demo-itw.de
ln -sf /etc/nginx/sites-available/termin.demo-itw.de /etc/nginx/sites-enabled/termin.demo-itw.de
nginx -t && systemctl reload nginx

# 5. Setup mailserver config directory
echo "[5/6] Setting up mailserver config..."
mkdir -p "$APP_DIR/mailserver/config"

# 6. Start Docker containers
echo "[6/6] Starting Docker containers..."
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "=== Deployment complete ==="
echo ""
echo "Next steps:"
echo "  1. Create .env file: cp $APP_DIR/.env.example $APP_DIR/.env && nano $APP_DIR/.env"
echo "  2. SSL certificate: certbot --nginx -d termin.demo-itw.de"
echo "  3. Setup DNS A-Record: termin.demo-itw.de -> $(curl -s ifconfig.me)"
echo "  4. Check health: curl https://termin.demo-itw.de/health"
