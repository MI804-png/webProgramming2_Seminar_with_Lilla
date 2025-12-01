-- ReNew Ltd. Notebook Database
-- Database for refurbished notebook sales

CREATE DATABASE IF NOT EXISTS notebook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE notebook;

-- Processor table
CREATE TABLE IF NOT EXISTS processor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    manufacturer VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Operating System table
CREATE TABLE IF NOT EXISTS opsystem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    osname VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notebook table
CREATE TABLE IF NOT EXISTS notebook (
    id INT AUTO_INCREMENT PRIMARY KEY,
    manufacturer VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    display DECIMAL(4,1) NOT NULL COMMENT 'Display size in inches',
    memory INT NOT NULL COMMENT 'Memory size in MiB',
    harddisk INT NOT NULL COMMENT 'Hard disk size in GB',
    videocontroller VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL COMMENT 'Price in pounds',
    processorid INT NOT NULL,
    opsystemid INT NOT NULL,
    pieces INT NOT NULL DEFAULT 0 COMMENT 'Number of machines in stock',
    FOREIGN KEY (processorid) REFERENCES processor(id),
    FOREIGN KEY (opsystemid) REFERENCES opsystem(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'registered') DEFAULT 'registered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    admin_reply TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample processors
INSERT INTO processor (manufacturer, type) VALUES
('Intel', 'Core i5-8250U'),
('Intel', 'Core i7-8550U'),
('AMD', 'Ryzen 5 3500U'),
('Intel', 'Core i3-7100U'),
('AMD', 'Ryzen 7 4700U'),
('Intel', 'Core i5-10210U'),
('AMD', 'Ryzen 5 4500U'),
('Intel', 'Core i7-1065G7');

-- Insert sample operating systems
INSERT INTO opsystem (osname) VALUES
('Windows 10 Home'),
('Windows 10 Pro'),
('Windows 11 Home'),
('Windows 11 Pro'),
('Ubuntu Linux 20.04'),
('Ubuntu Linux 22.04'),
('No OS');

-- Insert sample notebooks (refurbished, prices are sample data)
INSERT INTO notebook (manufacturer, type, display, memory, harddisk, videocontroller, price, processorid, opsystemid, pieces) VALUES
('Dell', 'Latitude 5590', 15.6, 8192, 256, 'Intel UHD Graphics 620', 450.00, 1, 1, 5),
('HP', 'EliteBook 840 G5', 14.0, 16384, 512, 'Intel UHD Graphics 620', 650.00, 2, 2, 3),
('Lenovo', 'ThinkPad T480', 14.0, 8192, 256, 'Intel UHD Graphics 620', 500.00, 1, 1, 7),
('ASUS', 'VivoBook 15', 15.6, 8192, 512, 'AMD Radeon Vega 8', 420.00, 3, 3, 10),
('Acer', 'Aspire 5', 15.6, 4096, 500, 'Intel UHD Graphics 620', 350.00, 4, 7, 8),
('Dell', 'XPS 13 9370', 13.3, 16384, 512, 'Intel Iris Plus Graphics', 800.00, 2, 2, 2),
('HP', 'ProBook 450 G7', 15.6, 8192, 256, 'NVIDIA GeForce MX130', 550.00, 1, 1, 6),
('Lenovo', 'IdeaPad 3', 15.6, 8192, 512, 'AMD Radeon Vega 10', 480.00, 5, 3, 12),
('Dell', 'Inspiron 15 5000', 15.6, 8192, 1000, 'Intel UHD Graphics 620', 420.00, 4, 1, 9),
('ASUS', 'ZenBook 14', 14.0, 8192, 512, 'NVIDIA GeForce MX250', 680.00, 6, 4, 4),
('HP', 'Pavilion 15', 15.6, 16384, 512, 'AMD Radeon Vega 8', 580.00, 7, 3, 5),
('Lenovo', 'ThinkPad X1 Carbon', 14.0, 16384, 512, 'Intel Iris Plus Graphics', 950.00, 8, 2, 3),
('Acer', 'Swift 3', 14.0, 8192, 256, 'Intel UHD Graphics 620', 480.00, 6, 1, 7),
('Dell', 'Latitude 7490', 14.0, 16384, 256, 'Intel UHD Graphics 620', 720.00, 2, 2, 4),
('HP', 'EliteBook 850 G6', 15.6, 16384, 512, 'AMD Radeon RX 550', 780.00, 2, 4, 2);

-- Insert default users (passwords: admin123 for admin, hello for testuser)
-- Password hashes are SHA-256
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@renew.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin'),
('testuser', 'test@renew.com', '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824', 'registered');

-- Sample contact messages
INSERT INTO contact_messages (name, email, subject, message, status) VALUES
('John Smith', 'john@example.com', 'Bulk Purchase Inquiry', 'I am interested in purchasing 10 notebooks for my company. Do you offer discounts for bulk orders?', 'new'),
('Sarah Johnson', 'sarah@example.com', 'Warranty Information', 'What kind of warranty do you provide on refurbished notebooks?', 'read'),
('Michael Brown', 'michael@example.com', 'Custom Configuration', 'Can I request a specific configuration for a ThinkPad model?', 'new');
