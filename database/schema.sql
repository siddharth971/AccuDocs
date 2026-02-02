-- AccuDocs Database Schema
-- MySQL 8.0+

-- Create database
CREATE DATABASE IF NOT EXISTS accudocs
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE accudocs;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  mobile VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(255) NULL,
  role ENUM('admin', 'client') NOT NULL DEFAULT 'client',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_mobile (mobile),
  INDEX idx_users_role (role),
  INDEX idx_users_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  user_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_clients_code (code),
  INDEX idx_clients_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Years table
CREATE TABLE IF NOT EXISTS years (
  id CHAR(36) PRIMARY KEY,
  year CHAR(4) NOT NULL,
  client_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE KEY unique_client_year (client_id, year),
  INDEX idx_years_client_id (client_id),
  INDEX idx_years_year (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id CHAR(36) PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  s3_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  year_id CHAR(36) NOT NULL,
  uploaded_by CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (year_id) REFERENCES years(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_documents_year_id (year_id),
  INDEX idx_documents_uploaded_by (uploaded_by),
  INDEX idx_documents_file_name (file_name),
  INDEX idx_documents_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OTPs table
CREATE TABLE IF NOT EXISTS otps (
  id CHAR(36) PRIMARY KEY,
  mobile VARCHAR(20) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_otps_mobile (mobile),
  INDEX idx_otps_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logs table (Audit Trail)
CREATE TABLE IF NOT EXISTS logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_logs_user_id (user_id),
  INDEX idx_logs_action (action),
  INDEX idx_logs_created_at (created_at),
  INDEX idx_logs_ip (ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: Admin@123)
INSERT INTO users (id, name, mobile, password, role, is_active, created_at, updated_at)
VALUES (
  UUID(),
  'Admin',
  '+919999999999',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.K8Ih4FhQIXP.Hy',
  'admin',
  TRUE,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Create view for client summary
CREATE OR REPLACE VIEW v_client_summary AS
SELECT 
  c.id AS client_id,
  c.code AS client_code,
  u.name AS client_name,
  u.mobile AS client_mobile,
  u.is_active,
  COUNT(DISTINCT y.id) AS year_count,
  COUNT(DISTINCT d.id) AS document_count,
  COALESCE(SUM(d.size), 0) AS total_size,
  c.created_at
FROM clients c
JOIN users u ON c.user_id = u.id
LEFT JOIN years y ON c.id = y.client_id
LEFT JOIN documents d ON y.id = d.year_id
GROUP BY c.id, c.code, u.name, u.mobile, u.is_active, c.created_at;

-- Create view for recent activity
CREATE OR REPLACE VIEW v_recent_activity AS
SELECT 
  l.id,
  l.action,
  l.description,
  l.ip,
  l.created_at,
  u.name AS user_name,
  u.mobile AS user_mobile
FROM logs l
LEFT JOIN users u ON l.user_id = u.id
ORDER BY l.created_at DESC
LIMIT 100;

-- Stored procedure to cleanup expired OTPs
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_cleanup_expired_otps()
BEGIN
  DELETE FROM otps WHERE expires_at < NOW();
END //
DELIMITER ;

-- Stored procedure to cleanup old logs
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_cleanup_old_logs(IN retention_days INT)
BEGIN
  DELETE FROM logs WHERE created_at < DATE_SUB(NOW(), INTERVAL retention_days DAY);
END //
DELIMITER ;

-- Event to auto-cleanup expired OTPs (runs every hour)
-- Enable event scheduler: SET GLOBAL event_scheduler = ON;
CREATE EVENT IF NOT EXISTS evt_cleanup_expired_otps
ON SCHEDULE EVERY 1 HOUR
DO CALL sp_cleanup_expired_otps();

-- Event to auto-cleanup old logs (runs daily)
CREATE EVENT IF NOT EXISTS evt_cleanup_old_logs
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO CALL sp_cleanup_old_logs(90);
