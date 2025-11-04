#!/bin/bash
# TechCorp Solutions - IHUTSC Server Deployment Script
# Nabil Salama Rezk Mikhael - IHUTSC Deployment

echo "🚀 TechCorp Solutions - IHUTSC Server Deployment"
echo "=================================================="
echo "Student: Nabil Salama Rezk Mikhael"
echo "Neptun: IHUTSC"
echo "Server: 143.47.98.96:4206"
echo "Route: /app206"
echo ""

# Check if we're on the Linux server
if [ ! -d "/home/student206" ]; then
    echo "❌ This script should be run on the Linux server (143.47.98.96)"
    echo "Please connect via SSH first: ssh student206@143.47.98.96"
    exit 1
fi

# Set up variables
NODE_VERSION="18"
APP_NAME="app206"
APP_PORT="4206"
DB_USER="studb206"
DB_NAME="db206"
LINUX_USER="student206"

echo "📦 Step 1: Installing Node.js and dependencies..."

# Update system packages
sudo apt update

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

echo "✅ Node.js $(node --version) and PM2 installed"

echo "📁 Step 2: Setting up application directory..."

# Ensure we're in the correct directory
cd /home/$LINUX_USER/exercise || {
    echo "❌ Exercise directory not found. Creating it..."
    mkdir -p /home/$LINUX_USER/exercise
    cd /home/$LINUX_USER/exercise
}

echo "✅ Application directory ready: $(pwd)"

echo "📦 Step 3: Installing Node.js dependencies..."

# Install production dependencies
npm ci --production

echo "✅ Dependencies installed"

echo "🗄️ Step 4: Setting up database..."

# Create database setup script
cat > setup_database.sql << EOF
-- Create database and user if they don't exist
CREATE DATABASE IF NOT EXISTS $DB_NAME;

-- Create the database user (may already exist)
-- Note: You may need to run this as MySQL root user
-- CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY 'mikha@2001';
-- GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
-- FLUSH PRIVILEGES;

USE $DB_NAME;

-- Create tables from company_db.sql
-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id int(11) NOT NULL AUTO_INCREMENT,
  username varchar(50) NOT NULL UNIQUE,
  email varchar(100) NOT NULL UNIQUE,
  password_hash varchar(255) NOT NULL,
  role enum('visitor', 'registered', 'admin') NOT NULL DEFAULT 'registered',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table for displaying company products/services
CREATE TABLE IF NOT EXISTS products (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  description text,
  price decimal(10,2),
  category_id int(11),
  image_url varchar(255),
  status enum('active', 'inactive') DEFAULT 'active',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table for product categorization
CREATE TABLE IF NOT EXISTS categories (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  description text,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  email varchar(100) NOT NULL,
  subject varchar(200),
  message text NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status enum('new', 'read', 'replied') DEFAULT 'new',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects table for showcasing company work
CREATE TABLE IF NOT EXISTS projects (
  id int(11) NOT NULL AUTO_INCREMENT,
  title varchar(100) NOT NULL,
  description text,
  client_name varchar(100),
  start_date date,
  end_date date,
  status enum('planning', 'in_progress', 'completed', 'on_hold') DEFAULT 'planning',
  image_url varchar(255),
  technologies text,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraint
ALTER TABLE products ADD CONSTRAINT fk_products_category 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Insert default users
INSERT IGNORE INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@techcorp.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin'),
('testuser', 'test@techcorp.com', '2cf24dba4f21d4288094e9e6bbf6e25c39005114ca4b143451d6d5d861919daa', 'registered');

-- Insert sample categories
INSERT IGNORE INTO categories (id, name, description) VALUES
(1, 'Web Development', 'Custom web applications and websites'),
(2, 'Mobile Apps', 'iOS and Android mobile applications'),
(3, 'Software Solutions', 'Desktop and enterprise software'),
(4, 'Consulting', 'Technology consulting and advisory services'),
(5, 'Cloud Services', 'Cloud infrastructure and migration services');

-- Insert sample products/services
INSERT IGNORE INTO products (id, name, description, price, category_id, status) VALUES
(1, 'Custom Website Development', 'Professional website development with modern technologies', 2500.00, 1, 'active'),
(2, 'E-commerce Platform', 'Full-featured online store with payment integration', 5000.00, 1, 'active'),
(3, 'Mobile App Development', 'Native iOS and Android app development', 8000.00, 2, 'active'),
(4, 'Cloud Migration Service', 'Complete cloud infrastructure migration', 3500.00, 5, 'active'),
(5, 'Business Process Automation', 'Custom software for business process automation', 4500.00, 3, 'active');

-- Insert sample projects
INSERT IGNORE INTO projects (id, title, description, client_name, start_date, end_date, status, technologies) VALUES
(1, 'E-commerce Platform for RetailCorp', 'Complete online shopping platform with inventory management', 'RetailCorp Ltd.', '2024-01-15', '2024-04-30', 'completed', 'Node.js, React, MySQL, Docker'),
(2, 'Mobile Banking App', 'Secure mobile banking application with biometric authentication', 'SecureBank', '2024-03-01', '2024-08-15', 'completed', 'React Native, Node.js, PostgreSQL, AWS');

-- Insert sample contact messages
INSERT IGNORE INTO contact_messages (id, name, email, subject, message, status) VALUES
(1, 'John Smith', 'john.smith@email.com', 'Web Development Inquiry', 'Hi, I am interested in your web development services for my startup.', 'new'),
(2, 'Sarah Johnson', 'sarah.j@company.com', 'Mobile App Development', 'We need a mobile app for our retail business.', 'read');

EOF

# Import database schema (you may need to provide MySQL root password)
echo "Setting up database schema..."
mysql -u $DB_USER -p$'mikha@2001' $DB_NAME < setup_database.sql 2>/dev/null || {
    echo "⚠️  Database setup may require manual intervention"
    echo "Please run: mysql -u root -p < setup_database.sql"
}

echo "✅ Database setup completed"

echo "🔧 Step 5: Configuring application..."

# Copy production environment file
cp .env.production .env

# Set proper permissions
chmod 600 .env
chmod +x *.sh

echo "✅ Application configured"

echo "🚀 Step 6: Starting application with PM2..."

# Stop existing instance if running
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

echo "✅ Application started successfully!"

echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo "======================="
echo "📍 Server: 143.47.98.96"
echo "🌐 URL: http://143.47.98.96:4206/app206"
echo "🏥 Health: http://143.47.98.96:4206/app206/health"
echo "👤 Admin: admin / admin123"
echo ""
echo "📋 Management Commands:"
echo "pm2 status          # Check application status"
echo "pm2 logs app206     # View application logs"
echo "pm2 restart app206  # Restart application"
echo "pm2 stop app206     # Stop application"
echo ""
echo "🎯 Your homework is now deployed and running!"
