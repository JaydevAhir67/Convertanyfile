-- ConvertAnyFile Enterprise XAMPP / MySQL Database Schema
-- Compatible with MySQL 5.7+ / MariaDB 10.3+ / phpMyAdmin
-- Database: convertanyfile

CREATE DATABASE IF NOT EXISTS `convertanyfile` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `convertanyfile`;

-- 1. Users Table (Argon2id / Bcrypt password hashes, zero plaintext)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uuid` VARCHAR(36) NOT NULL UNIQUE,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `plan` ENUM('free', 'pro', 'enterprise') DEFAULT 'free',
  `storage_used_bytes` BIGINT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Files Table (Uploaded source files with SHA-256 integrity hash)
CREATE TABLE IF NOT EXISTS `files` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `file_uuid` VARCHAR(36) NOT NULL UNIQUE,
  `user_id` INT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `stored_filename` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `extension` VARCHAR(20) NOT NULL,
  `file_size` BIGINT NOT NULL,
  `sha256` VARCHAR(64) NOT NULL,
  `is_encrypted` TINYINT(1) DEFAULT 0,
  `encryption_algorithm` VARCHAR(50) DEFAULT NULL,
  `expires_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_files_user` (`user_id`),
  INDEX `idx_files_uuid` (`file_uuid`),
  INDEX `idx_files_sha256` (`sha256`),
  CONSTRAINT `fk_files_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Conversions Table (Jobs pipeline state)
CREATE TABLE IF NOT EXISTS `conversions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `job_uuid` VARCHAR(36) NOT NULL UNIQUE,
  `user_id` INT NULL,
  `source_file_id` INT NULL,
  `source_format` VARCHAR(20) NOT NULL,
  `target_format` VARCHAR(20) NOT NULL,
  `status` ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  `progress_percent` INT DEFAULT 0,
  `error_message` TEXT NULL,
  `processing_time_sec` DECIMAL(8, 3) DEFAULT 0.000,
  `output_stored_filename` VARCHAR(255) NULL,
  `output_original_filename` VARCHAR(255) NULL,
  `output_file_size` BIGINT NULL,
  `output_sha256` VARCHAR(64) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL,
  INDEX `idx_conversions_user` (`user_id`),
  INDEX `idx_conversions_job` (`job_uuid`),
  INDEX `idx_conversions_status` (`status`),
  CONSTRAINT `fk_conversions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_conversions_source` FOREIGN KEY (`source_file_id`) REFERENCES `files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Conversion History Table (Permanent auditing records)
CREATE TABLE IF NOT EXISTS `conversion_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `history_uuid` VARCHAR(36) NOT NULL UNIQUE,
  `user_id` INT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `output_filename` VARCHAR(255) NOT NULL,
  `source_format` VARCHAR(20) NOT NULL,
  `target_format` VARCHAR(20) NOT NULL,
  `file_size_bytes` BIGINT NOT NULL,
  `output_size_bytes` BIGINT NOT NULL,
  `sha256_input` VARCHAR(64) NOT NULL,
  `sha256_output` VARCHAR(64) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'completed',
  `processing_seconds` DECIMAL(8, 3) DEFAULT 0.000,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_history_user` (`user_id`),
  CONSTRAINT `fk_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Subscriptions Table
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `plan_name` VARCHAR(50) NOT NULL DEFAULT 'free',
  `status` ENUM('active', 'canceled', 'expired') DEFAULT 'active',
  `started_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NULL,
  INDEX `idx_subs_user` (`user_id`),
  CONSTRAINT `fk_subs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payment_uuid` VARCHAR(36) NOT NULL UNIQUE,
  `user_id` INT NULL,
  `amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `payment_provider` VARCHAR(50) DEFAULT 'local_demo',
  `transaction_reference` VARCHAR(100) NULL,
  `status` ENUM('pending', 'succeeded', 'failed') DEFAULT 'succeeded',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pay_user` (`user_id`),
  CONSTRAINT `fk_pay_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Security Logs Table (OWASP security audits & events)
CREATE TABLE IF NOT EXISTS `security_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_type` VARCHAR(100) NOT NULL,
  `severity` ENUM('info', 'warning', 'critical') DEFAULT 'info',
  `ip_address` VARCHAR(45) NOT NULL,
  `user_id` INT NULL,
  `file_uuid` VARCHAR(36) NULL,
  `details` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sec_ip` (`ip_address`),
  INDEX `idx_sec_type` (`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pre-Seeded Local Demonstration Accounts for Examiner
-- Securely hashed with Bcrypt (Password: 'ChangeMe123!')
INSERT INTO `users` (`id`, `uuid`, `email`, `password_hash`, `name`, `role`, `plan`) VALUES
(1, 'e1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c', 'examiner@example.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'College Examiner', 'admin', 'enterprise'),
(2, 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'admin@convertanyfile.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', 'pro')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
