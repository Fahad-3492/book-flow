-- BookFlow Database Schema
-- Run this once against your MySQL database to create all tables.
-- Usage: mysql -u root -p bookflow < schema.sql

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Defines the admin's recurring weekly working hours.
-- day_of_week: 0 = Sunday, 1 = Monday, ... 6 = Saturday
CREATE TABLE IF NOT EXISTS availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  day_of_week TINYINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (start_time < end_time)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  service_id INT NOT NULL,
  booking_datetime DATETIME NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
  payment_status ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
  stripe_payment_intent_id VARCHAR(255) DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
  INDEX idx_booking_datetime (booking_datetime),
  INDEX idx_user_bookings (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Seed default working hours: Monday-Friday, 9 AM - 5 PM.
-- Adjust or delete these rows via the admin availability endpoints once live.
INSERT INTO availability (day_of_week, start_time, end_time)
SELECT * FROM (
  SELECT 1 AS day_of_week, '09:00:00' AS start_time, '17:00:00' AS end_time UNION ALL
  SELECT 2, '09:00:00', '17:00:00' UNION ALL
  SELECT 3, '09:00:00', '17:00:00' UNION ALL
  SELECT 4, '09:00:00', '17:00:00' UNION ALL
  SELECT 5, '09:00:00', '17:00:00'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM availability LIMIT 1);

-- Seed one admin user so you can log in immediately after setup.
-- Password below is "Admin123!" hashed with bcrypt (10 rounds).
-- Change this password after first login in a real deployment.
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Admin',
  'admin@bookflow.com',
  '$2a$10$C9EcrErxW2D2q8LQcIIeUOb8BgnfUgmAjnKcAK3dWaXtcg/tf8.Ti',
  'admin'
)
ON DUPLICATE KEY UPDATE email = email;
