#!/bin/bash
set -e
echo "=== Installing Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "=== Installing MySQL ==="
sudo apt-get install -y mysql-server
sudo systemctl enable --now mysql

echo "=== Creating database ==="
DB_PASS="FinPulse2024Secure!"
sudo mysql -e "CREATE DATABASE IF NOT EXISTS finpulse CHARACTER SET utf8mb4;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'finpulse_app'@'localhost' IDENTIFIED BY '${DB_PASS}';"
sudo mysql -e "GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,ALTER,INDEX,REFERENCES ON finpulse.* TO 'finpulse_app'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo "=== Creating .env ==="
JWT_SECRET=$(openssl rand -hex 64)
VM_IP=$(curl -s -4 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
cat > .env << ENVEOF
DATABASE_URL="mysql://finpulse_app:${DB_PASS}@localhost:3306/finpulse?connection_limit=10"
JWT_SECRET="${JWT_SECRET}"
NEXTAUTH_SECRET="${JWT_SECRET:0:32}"
NEXTAUTH_URL="http://${VM_IP}:3000"
NEXT_PUBLIC_APP_NAME="FinPulse"
NODE_ENV="production"
ENVEOF
echo "DB Password: ${DB_PASS}"
echo "VM IP: ${VM_IP}"

echo "=== npm install ==="
npm install

echo "=== Prisma generate + push ==="
npx prisma generate
npx prisma db push

echo "=== Seeding database ==="
node prisma/seed.js

echo "=== Building Next.js ==="
npm run build

echo "=== Installing PM2 ==="
sudo npm install -g pm2

echo "=== Starting app ==="
pm2 delete finpulse 2>/dev/null || true
pm2 start npm --name finpulse -- start
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

echo ""
echo "======================================"
echo "FinPulse is LIVE at http://${VM_IP}:3000"
echo "Login: admin@acme.com / Admin@123456"
echo "======================================"
