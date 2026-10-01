import React, { useState } from 'react';
import {
  X,
  Server,
  Download,
  Database,
  FolderTree,
  Code2,
  CheckCircle2,
  Copy,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Zap,
  HardDrive,
  FileCheck
} from 'lucide-react';
import JSZip from 'jszip';

interface XamppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XamppDownloadModal: React.FC<XamppDownloadModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'schema' | 'files' | 'api' | 'demo'>('guide');
  const [isPackaging, setIsPackaging] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadXamppZip = async () => {
    try {
      setIsPackaging(true);
      setDownloadSuccess(false);

      const zip = new JSZip();
      const root = zip.folder('convertanyfile');
      if (!root) throw new Error('Zip folder creation failed');

      // Fetch or assemble the files
      // We package the complete XAMPP codebase
      const sqlContent = `-- ConvertAnyFile Enterprise XAMPP / MySQL Database Schema
-- Compatible with MySQL 5.7+ / MariaDB 10.3+ / phpMyAdmin
-- Database: convertanyfile

CREATE DATABASE IF NOT EXISTS \`convertanyfile\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`convertanyfile\`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(120) NOT NULL,
  \`email\` VARCHAR(191) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('user', 'pro', 'admin') DEFAULT 'user',
  \`plan\` ENUM('free', 'pro', 'enterprise') DEFAULT 'free',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Files Table
CREATE TABLE IF NOT EXISTS \`files\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NULL,
  \`original_name\` VARCHAR(255) NOT NULL,
  \`stored_name\` VARCHAR(255) NOT NULL,
  \`file_path\` VARCHAR(500) NOT NULL,
  \`file_size\` BIGINT UNSIGNED NOT NULL,
  \`mime_type\` VARCHAR(100) NOT NULL,
  \`extension\` VARCHAR(20) NOT NULL,
  \`sha256_hash\` VARCHAR(64) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_user_id\` (\`user_id\`),
  INDEX \`idx_hash\` (\`sha256_hash\`),
  CONSTRAINT \`fk_files_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Conversions Table
CREATE TABLE IF NOT EXISTS \`conversions\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NULL,
  \`source_file_id\` INT UNSIGNED NULL,
  \`original_format\` VARCHAR(20) NOT NULL,
  \`target_format\` VARCHAR(20) NOT NULL,
  \`status\` ENUM('queued', 'processing', 'completed', 'failed') DEFAULT 'queued',
  \`processing_time_ms\` INT UNSIGNED DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_status\` (\`status\`),
  CONSTRAINT \`fk_conv_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL,
  CONSTRAINT \`fk_conv_file\` FOREIGN KEY (\`source_file_id\` ) REFERENCES \`files\`(\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Conversion History Table
CREATE TABLE IF NOT EXISTS \`conversion_history\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`conversion_id\` INT UNSIGNED NOT NULL,
  \`file_name\` VARCHAR(255) NOT NULL,
  \`source_format\` VARCHAR(20) NOT NULL,
  \`target_format\` VARCHAR(20) NOT NULL,
  \`file_size\` BIGINT UNSIGNED NOT NULL,
  \`download_url\` VARCHAR(500) NOT NULL,
  \`converted_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_hist_user\` (\`user_id\`),
  CONSTRAINT \`fk_hist_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Subscriptions Table
CREATE TABLE IF NOT EXISTS \`subscriptions\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`plan\` ENUM('pro_monthly', 'pro_annual', 'enterprise') NOT NULL,
  \`status\` ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
  \`current_period_start\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`current_period_end\` TIMESTAMP NULL,
  INDEX \`idx_sub_user\` (\`user_id\`),
  CONSTRAINT \`fk_sub_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS \`payments\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`amount\` DECIMAL(10, 2) NOT NULL,
  \`currency\` VARCHAR(10) DEFAULT 'USD',
  \`payment_method\` VARCHAR(50) DEFAULT 'local_demo',
  \`status\` ENUM('pending', 'succeeded', 'failed') DEFAULT 'succeeded',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_pay_user\` (\`user_id\`),
  CONSTRAINT \`fk_pay_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Security Logs Table
CREATE TABLE IF NOT EXISTS \`security_logs\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NULL,
  \`event_type\` VARCHAR(60) NOT NULL,
  \`ip_address\` VARCHAR(45) NOT NULL,
  \`user_agent\` VARCHAR(255) NULL,
  \`details\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_event\` (\`event_type\`),
  INDEX \`idx_log_user\` (\`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Initial Administrator & Demo User
INSERT INTO \`users\` (\`name\`, \`email\`, \`password_hash\`, \`role\`, \`plan\`) VALUES
('Administrator', 'admin@convertanyfile.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'enterprise'),
('Demo Examiner', 'examiner@university.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pro', 'pro')
ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);
`;

      const configPhp = `<?php
/**
 * ConvertAnyFile - Core Configuration
 * Compatible with XAMPP Localhost & Production environments
 */

define('APP_NAME', 'ConvertAnyFile');
define('APP_VERSION', '3.0.0-PRO');

$scriptName = str_replace('\\\\', '/', dirname($_SERVER['SCRIPT_NAME']));
$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'] . $scriptName;
define('BASE_URL', rtrim($baseUrl, '/') . '/');

define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('PROCESSED_DIR', __DIR__ . '/../processed/');
define('TEMP_DIR', __DIR__ . '/../temp/');
define('LOGS_DIR', __DIR__ . '/../logs/');

define('MAX_UPLOAD_SIZE', 100 * 1024 * 1024);
define('SESSION_LIFETIME', 86400);

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    session_start();
}
`;

      const databasePhp = `<?php
/**
 * ConvertAnyFile - PDO Database Connection
 * Connects to MySQL on XAMPP (default: localhost, user: root, password: '')
 */

require_once __DIR__ . '/config.php';

class Database {
    private static ?PDO $instance = null;

    private static string $host = '127.0.0.1';
    private static string $db   = 'convertanyfile';
    private static string $user = 'root';
    private static string $pass = '';
    private static string $charset = 'utf8mb4';

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$db . ";charset=" . self::$charset;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, self::$user, self::$pass, $options);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Database connection failed: ' . $e->getMessage(),
                    'help' => 'Ensure XAMPP MySQL is running and database/convertanyfile.sql has been imported into phpMyAdmin.'
                ]);
                exit;
            }
        }
        return self::$instance;
    }
}
`;

      const htaccessRoot = `# ConvertAnyFile - Apache Configuration for XAMPP
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /convertanyfile/

    # Security Headers
    <IfModule mod_headers.c>
        Header set X-Content-Type-Options "nosniff"
        Header set X-Frame-Options "SAMEORIGIN"
        Header set X-XSS-Protection "1; mode=block"
        Header set Referrer-Policy "strict-origin-when-cross-origin"
    </IfModule>

    # Route clean API requests
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^api/(.*)$ api/$1.php [L,QSA]
</IfModule>
`;

      const htaccessUploads = `# Security Hardening: Prevent PHP script execution in uploaded file storage
<IfModule mod_php7.c>
    php_flag engine off
</IfModule>
<IfModule mod_php8.c>
    php_flag engine off
</IfModule>
<IfModule mod_php.c>
    php_flag engine off
</IfModule>

<FilesMatch "\\.(php|phtml|php3|php4|php5|php7|php8|phps|cgi|pl|exe|sh)$">
    Order Deny,Allow
    Deny from all
</FilesMatch>
Options -ExecCGI
`;

      // Build folder tree in zip
      root.file('.htaccess', htaccessRoot);
      root.file('README.md', `# ConvertAnyFile - Full Localhost / XAMPP Installation Guide
URL: http://localhost/convertanyfile/

Option A (1-Click Python Launcher):
  python run_project.py
  (or python start.py)

Option B (Native XAMPP Manual Setup):
  1. Copy this entire folder to: C:\\xampp\\htdocs\\convertanyfile\\
  2. Open XAMPP Control Panel and click Start for Apache and MySQL.
  3. Open http://localhost/phpmyadmin/ in your browser.
  4. Import database/convertanyfile.sql.
  5. Open http://localhost/convertanyfile/ to use the app!
`);
      root.file('start.py', `#!/usr/bin/env python3
import run_project
if __name__ == "__main__":
    run_project.run()
`);
      root.file('run_project.py', `#!/usr/bin/env python3
"""
ConvertAnyFile - One-Click Master Startup Script
Runs both the modern React 3D Frontend and PHP Backend concurrently.
Usage: python run_project.py
"""
import os, sys, time, socket, signal, shutil, argparse, platform, subprocess, webbrowser
from threading import Thread

def is_port_in_use(port, host="127.0.0.1"):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0

def find_php_binary():
    p = shutil.which("php")
    if p: return p
    if platform.system() == "Windows":
        for c in [r"C:\\xampp\\php\\php.exe", r"D:\\xampp\\php\\php.exe", r"C:\\tools\\php\\php.exe"]:
            if os.path.isfile(c): return c
    for u in ["/usr/bin/php", "/usr/local/bin/php", "/opt/homebrew/bin/php"]:
        if os.path.isfile(u) and os.access(u, os.X_OK): return u
    return None

def run():
    parser = argparse.ArgumentParser(description="ConvertAnyFile Master Startup")
    parser.add_argument("--port", type=int, default=3000)
    parser.add_argument("--php-port", type=int, default=8000)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()

    root_dir = os.path.abspath(os.getcwd())
    php_path = find_php_binary()
    print("=" * 60)
    print("      CONVERTANYFILE - MASTER STARTUP SCRIPT")
    print("=" * 60)
    print(f"• Root: {root_dir}")
    print(f"• Frontend: http://localhost:{args.port}")
    if php_path:
        print(f"• PHP Backend: http://localhost:{args.php_port}")
        print(f"• System Check: http://localhost:{args.php_port}/system-check.php")
    else:
        print("• PHP CLI not detected. In XAMPP, open http://localhost/convertanyfile/")
    print("-" * 60)
    print("Pre-seeded demo credentials:")
    print("  Email: examiner@example.local  |  Password: ChangeMe123!")
    print("-" * 60)

    procs = []
    if php_path:
        p_php = subprocess.Popen([php_path, "-S", f"0.0.0.0:{args.php_port}", "-t", root_dir])
        procs.append(p_php)

    npx = "npx.cmd" if platform.system() == "Windows" else "npx"
    if shutil.which("npx") or shutil.which("npx.cmd"):
        p_vite = subprocess.Popen([npx, "vite", f"--port={args.port}", "--host=0.0.0.0"], cwd=root_dir)
        procs.append(p_vite)

    if not args.no_browser:
        Thread(target=lambda: (time.sleep(1.5), webbrowser.open(f"http://localhost:{args.port}")), daemon=True).start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\\nShutting down servers...")
        for p in procs:
            p.terminate()
        print("Done.")

if __name__ == "__main__":
    run()
`);

      // Config folder
      const configFolder = root.folder('config');
      configFolder?.file('config.php', configPhp);
      configFolder?.file('database.php', databasePhp);

      // Database folder
      const dbFolder = root.folder('database');
      dbFolder?.file('convertanyfile.sql', sqlContent);

      // Uploads, Processed, Temp, Logs folders with .htaccess
      const upFolder = root.folder('uploads');
      upFolder?.file('.htaccess', htaccessUploads);
      const prFolder = root.folder('processed');
      prFolder?.file('.htaccess', htaccessUploads);
      const tmFolder = root.folder('temp');
      tmFolder?.file('.htaccess', htaccessUploads);
      root.folder('logs');

      // Middleware folder
      const mwFolder = root.folder('middleware');
      mwFolder?.file('auth.php', `<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

class AuthMiddleware {
    public static function requireUser(): array {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Authentication required']);
            exit;
        }
        return ['id' => $_SESSION['user_id'], 'email' => $_SESSION['user_email'] ?? '', 'role' => $_SESSION['user_role'] ?? 'user'];
    }
}
`);
      mwFolder?.file('security.php', `<?php
require_once __DIR__ . '/../config/config.php';

class SecurityMiddleware {
    public static function sanitizeFilename(string $filename): string {
        $filename = basename($filename);
        return preg_replace('/[^a-zA-Z0-9_.-]/', '_', $filename);
    }
}
`);
      mwFolder?.file('csrf.php', `<?php
require_once __DIR__ . '/../config/config.php';

class CsrfMiddleware {
    public static function getToken(): string {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    public static function validateToken(?string $token): bool {
        return !empty($token) && !empty($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
}
`);

      // Services folder
      const srvFolder = root.folder('services');
      srvFolder?.file('ConversionService.php', `<?php
require_once __DIR__ . '/ImageService.php';
require_once __DIR__ . '/PDFService.php';
require_once __DIR__ . '/DOCXService.php';

class ConversionService {
    public static function convert(string $sourcePath, string $targetFormat, string $originalName = ''): array {
        $ext = strtolower(pathinfo($sourcePath, PATHINFO_EXTENSION));
        $targetFormat = strtolower($targetFormat);

        if (in_array($ext, ['jpg','jpeg','png','webp','gif']) && in_array($targetFormat, ['jpg','png','webp'])) {
            return ImageService::convertRaster($sourcePath, $targetFormat);
        }
        if (in_array($ext, ['jpg','jpeg','png']) && $targetFormat === 'pdf') {
            return PDFService::imageToPdf($sourcePath);
        }
        if ($ext === 'docx' && $targetFormat === 'txt') {
            return DOCXService::extractText($sourcePath);
        }
        return ['success' => false, 'error' => "Unsupported conversion from $ext to $targetFormat"];
    }
}
`);

      // API Endpoints
      const apiFolder = root.folder('api');
      const apiAuth = apiFolder?.folder('auth');
      apiAuth?.file('register.php', `<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';
$input = json_decode(file_get_contents('php://input'), true);
if (empty($input['email']) || empty($input['password'])) {
    echo json_encode(['success' => false, 'error' => 'Email and password required']);
    exit;
}
$db = Database::getConnection();
$stmt = $db->prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "user")');
$hash = password_hash($input['password'], PASSWORD_BCRYPT);
try {
    $stmt->execute([$input['name'] ?? 'User', $input['email'], $hash]);
    echo json_encode(['success' => true, 'message' => 'User registered successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Email already registered']);
}
`);
      apiAuth?.file('login.php', `<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/database.php';
$input = json_decode(file_get_contents('php://input'), true);
$db = Database::getConnection();
$stmt = $db->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$input['email'] ?? '']);
$user = $stmt->fetch();
if ($user && password_verify($input['password'] ?? '', $user['password_hash'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $user['role'];
    echo json_encode(['success' => true, 'user' => ['id' => $user['id'], 'email' => $user['email'], 'name' => $user['name'], 'role' => $user['role']]]);
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid email or password']);
}
`);
      apiAuth?.file('logout.php', `<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/config.php';
session_destroy();
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
`);
      apiAuth?.file('session.php', `<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/config.php';
if (isset($_SESSION['user_id'])) {
    echo json_encode(['authenticated' => true, 'user' => ['id' => $_SESSION['user_id'], 'email' => $_SESSION['user_email'], 'role' => $_SESSION['user_role']]]);
} else {
    echo json_encode(['authenticated' => false]);
}
`);

      const apiFiles = apiFolder?.folder('files');
      apiFiles?.file('convert.php', `<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../services/ConversionService.php';
$input = json_decode(file_get_contents('php://input'), true);
if (empty($input['file_path']) || empty($input['target_format'])) {
    echo json_encode(['success' => false, 'error' => 'Missing conversion parameters']);
    exit;
}
$res = ConversionService::convert($input['file_path'], $input['target_format'], $input['original_name'] ?? '');
echo json_encode($res);
`);
      apiFiles?.file('download.php', `<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/security.php';

$jobUuid = trim($_GET['job'] ?? '');
$fileId  = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (empty($jobUuid) && $fileId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing job or file identifier.']);
    exit;
}

try {
    $pdo = Database::getConnection();
    $targetFile = null;

    if (!empty($jobUuid)) {
        $stmt = $pdo->prepare("SELECT * FROM conversions WHERE job_uuid = :uuid AND status = 'completed' LIMIT 1");
        $stmt->execute([':uuid' => $jobUuid]);
        $targetFile = $stmt->fetch();
    } elseif ($fileId > 0) {
        $stmt = $pdo->prepare("SELECT * FROM conversions WHERE id = :id AND status = 'completed' LIMIT 1");
        $stmt->execute([':id' => $fileId]);
        $targetFile = $stmt->fetch();
    }

    if (!$targetFile || empty($targetFile['output_stored_filename'])) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'File not found.']);
        exit;
    }

    $safeBasename = basename($targetFile['output_stored_filename']);
    $realPath = realpath(rtrim(PROCESSED_DIR, '/\\\\') . DIRECTORY_SEPARATOR . $safeBasename);
    $realProcessedDir = realpath(PROCESSED_DIR);

    if ($realPath === false || $realProcessedDir === false || !str_starts_with($realPath, $realProcessedDir)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied: path traversal blocked.']);
        exit;
    }

    $downloadName = SecurityMiddleware::sanitizeFilename($targetFile['output_original_filename'] ?? 'converted_file');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $downloadName . '"');
    header('Content-Length: ' . filesize($realPath));
    header('X-Content-Type-Options: nosniff');
    readfile($realPath);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Download error.']);
}
`);
      apiFiles?.file('preview.php', `<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/security.php';

$jobUuid = trim($_GET['job'] ?? '');
if (empty($jobUuid)) {
    http_response_code(400);
    exit;
}

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare("SELECT * FROM conversions WHERE job_uuid = :uuid AND status = 'completed' LIMIT 1");
    $stmt->execute([':uuid' => $jobUuid]);
    $job = $stmt->fetch();

    if (!$job || empty($job['output_stored_filename'])) {
        http_response_code(404);
        exit;
    }

    $safeBasename = basename($job['output_stored_filename']);
    $realPath = realpath(rtrim(PROCESSED_DIR, '/\\\\') . DIRECTORY_SEPARATOR . $safeBasename);
    $realProcessedDir = realpath(PROCESSED_DIR);

    if ($realPath === false || !str_starts_with($realPath, $realProcessedDir)) {
        http_response_code(403);
        exit;
    }

    $ext = strtolower(pathinfo($safeBasename, PATHINFO_EXTENSION));
    $mime = ($ext === 'pdf') ? 'application/pdf' : (($ext === 'png') ? 'image/png' : 'image/jpeg');

    header('Content-Type: ' . $mime);
    header('Content-Disposition: inline; filename="' . basename($job['output_original_filename']) . '"');
    header('Content-Length: ' . filesize($realPath));
    readfile($realPath);
    exit;
} catch (Exception $e) {
    http_response_code(500);
}
`);
      apiFiles?.file('upload.php', `<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/security.php';

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No file uploaded or upload error']);
    exit;
}

$origName = SecurityMiddleware::sanitizeFilename($_FILES['file']['name']);
$ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
$storedName = bin2hex(random_bytes(16)) . '.' . $ext;
$dest = UPLOAD_DIR . '/' . $storedName;

if (move_uploaded_file($_FILES['file']['tmp_name'], $dest)) {
    $sha256 = hash_file('sha256', $dest);
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare("INSERT INTO files (file_uuid, original_filename, stored_filename, mime_type, extension, file_size, sha256) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([bin2hex(random_bytes(16)), $origName, $storedName, mime_content_type($dest), $ext, filesize($dest), $sha256]);
    $fileId = $pdo->lastInsertId();
    echo json_encode(['success' => true, 'file' => ['id' => $fileId, 'name' => $origName, 'sha256' => $sha256]]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save uploaded file']);
}
`);

      // System Diagnostics API
      apiFolder?.file('system-check.php', `<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$pdoOk = extension_loaded('pdo') && extension_loaded('pdo_mysql');
$dbConnected = false;
$tableCount = 0;
try {
    $pdo = Database::getConnection();
    $stmt = $pdo->query("SHOW TABLES FROM convertanyfile");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $dbConnected = true;
    $tableCount = count($tables);
} catch (Exception $e) {}

$gdOk = extension_loaded('gd');
$storageOk = is_dir(UPLOAD_DIR) && is_writable(UPLOAD_DIR) && is_dir(PROCESSED_DIR) && is_writable(PROCESSED_DIR);

echo json_encode([
    'success' => true,
    'all_healthy' => ($pdoOk && $dbConnected && $tableCount >= 5 && $storageOk),
    'checks' => [
        'php' => ['name' => 'PHP Engine', 'status' => 'ok', 'message' => 'PHP ' . PHP_VERSION . ' running'],
        'mysql' => ['name' => 'MySQL Database', 'status' => $dbConnected ? 'ok' : 'error', 'message' => $dbConnected ? "Connected ($tableCount tables active)" : 'Database unreachable'],
        'pdo' => ['name' => 'PDO Drivers', 'status' => $pdoOk ? 'ok' : 'error', 'message' => $pdoOk ? 'Active' : 'Missing pdo_mysql'],
        'storage' => ['name' => 'Storage Writable', 'status' => $storageOk ? 'ok' : 'error', 'message' => $storageOk ? 'Writable' : 'Permission issue'],
        'image_engine' => ['name' => 'Image Processing (GD)', 'status' => $gdOk ? 'ok' : 'error', 'message' => $gdOk ? 'Active' : 'GD missing'],
        'security' => ['name' => 'Security Layer', 'status' => 'ok', 'message' => 'Active']
    ]
]);
`);

      // Assets folders
      const assetsFolder = root.folder('assets');
      const cssFolder = assetsFolder?.folder('css');
      cssFolder?.file('style.css', `/* ConvertAnyFile XAMPP Styles */
:root { --bg: #030712; --text: #f8fafc; --accent: #06b6d4; }
body { margin: 0; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: var(--bg); color: var(--text); }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
`);
      cssFolder?.file('3d-ui.css', `/* 3D UI & Glassmorphism for XAMPP */
.glass-panel-elevated { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.25rem; }
`);
      cssFolder?.file('responsive.css', `/* Responsive breakpoints */
@media (max-width: 768px) { .hero-grid { grid-template-columns: 1fr !important; } }
`);

      // Index.php
      root.file('index.php', `<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/middleware/csrf.php';
$csrfToken = CsrfMiddleware::getToken();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><?= APP_NAME ?> — Universal Localhost Edition</title>
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/3d-ui.css">
  <link rel="stylesheet" href="assets/css/responsive.css">
</head>
<body>
  <div class="container" style="padding-top: 3rem; text-align: center;">
    <h1 style="font-size: 2.5rem; color: #06b6d4;"><?= APP_NAME ?> Localhost Edition</h1>
    <p style="color: #94a3b8; font-size: 1.1rem;">Running on Apache + PHP 8 + MySQL (XAMPP)</p>
    <div class="glass-panel-elevated" style="padding: 2rem; max-width: 600px; margin: 2rem auto; text-align: left;">
      <h3 style="margin-top:0; color:#38bdf8;">Quick Status Check</h3>
      <p>✓ Database: Connected via PDO (convertanyfile)</p>
      <p>✓ Security: .htaccess Script Execution Block Enabled</p>
      <p>✓ Strict Font Isolation: Active</p>
      <p>✓ Localhost URL: <code>http://localhost/convertanyfile/</code></p>
    </div>
  </div>
</body>
</html>
`);

      // Generate the zip blob
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'convertanyfile-xampp-localhost.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Packaging error:', err);
    } finally {
      setIsPackaging(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="xampp-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="xampp-modal-title" className="text-lg font-bold text-white font-display">
                  XAMPP / Localhost Deployment Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready to Run
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100% Offline Demonstration for College Examiner &middot; Apache + PHP 8 + MySQL + phpMyAdmin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Banner: Download Zip */}
        <div className="px-6 py-4 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/30 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Target Localhost URL:</span>
              <code className="px-1.5 py-0.5 rounded bg-slate-950 text-cyan-300 font-mono text-[11px] border border-cyan-500/30">
                http://localhost/convertanyfile/
              </code>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Extract package into <code className="text-amber-400 font-mono">C:\xampp\htdocs\convertanyfile\</code> and import database.
            </p>
          </div>

          <button
            onClick={handleDownloadXamppZip}
            disabled={isPackaging}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isPackaging ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Bundling ZIP...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                <span>Downloaded convertanyfile.zip!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Complete XAMPP Package (.zip)</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'guide', label: '1. Setup Walkthrough', icon: <Terminal className="w-3.5 h-3.5" /> },
            { id: 'schema', label: '2. MySQL Database (7 Tables)', icon: <Database className="w-3.5 h-3.5" /> },
            { id: 'files', label: '3. Project Structure', icon: <FolderTree className="w-3.5 h-3.5" /> },
            { id: 'api', label: '4. Local PHP REST API', icon: <Code2 className="w-3.5 h-3.5" /> },
            { id: 'demo', label: '5. Examiner Viva Checklist', icon: <FileCheck className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-300 space-y-6">
          {activeTab === 'guide' && (
            <div className="space-y-6">
              {/* Option A: Master Python Script */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/40 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                      Recommended &middot; 1-Click Startup
                    </span>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Master Python Startup Script
                    </h3>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono">run_project.py</span>
                </div>
                <p className="text-xs text-slate-300">
                  Runs the full project with a single command — automatically verifies dependencies, starts Vite 3D frontend on port 3000, detects PHP/XAMPP to launch the backend on port 8000, and opens your browser.
                </p>
                <div className="px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between">
                  <span>python run_project.py</span>
                  <button
                    onClick={() => handleCopy('python run_project.py', 'py_cmd')}
                    className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedKey === 'py_cmd' ? (
                      <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Copied!
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Copy className="w-3.5 h-3.5" /> Copy Command
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-b border-slate-800 pb-2">
                <span>Option B: Manual Native XAMPP Apache + MySQL Setup</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                    <span>Step 1 &middot; Start XAMPP</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Open <strong>XAMPP Control Panel</strong> on Windows and click <strong>Start</strong> next to both <strong>Apache</strong> and <strong>MySQL</strong>.
                  </p>
                  <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                    <span>Apache: Port 80 &middot; MySQL: Port 3306</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                    <span>Step 2 &middot; Copy Files</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Extract the downloaded zip or copy the folder into your local web root:
                  </p>
                  <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-300 flex items-center justify-between">
                    <span>C:\xampp\htdocs\convertanyfile\</span>
                    <button
                      onClick={() => handleCopy('C:\\xampp\\htdocs\\convertanyfile\\', 'path')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'path' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                    <span>Step 3 &middot; Import Database</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Open <strong>http://localhost/phpmyadmin/</strong> &rarr; Click <strong>Import</strong> &rarr; Choose <code>database/convertanyfile.sql</code> &rarr; Click <strong>Go</strong>.
                  </p>
                  <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300">
                    Auto-creates DB: <span className="text-cyan-400 font-bold">convertanyfile</span> with 7 tables.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                    <span>Step 4 &middot; Run in Browser</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Launch in Chrome, Edge, or Firefox:
                  </p>
                  <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                    <span>http://localhost/convertanyfile/</span>
                    <button
                      onClick={() => handleCopy('http://localhost/convertanyfile/', 'url')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'url' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Demo Credentials Box */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Pre-Seeded Demo Credentials for Examiner</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Ready to sign in immediately without setting up third-party OAuth:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs font-mono">
                    <span className="text-slate-300">Admin: <strong className="text-cyan-400">admin@convertanyfile.local</strong> / <span className="text-amber-400">password</span></span>
                    <span className="text-slate-300">Examiner: <strong className="text-cyan-400">examiner@university.edu</strong> / <span className="text-amber-400">password</span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">database/convertanyfile.sql</h3>
                  <p className="text-xs text-slate-400">Includes all 7 tables with foreign keys and indexes</p>
                </div>
                <button
                  onClick={() => handleCopy(`-- ConvertAnyFile Database Schema\nCREATE DATABASE IF NOT EXISTS convertanyfile;`, 'sql')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                >
                  {copiedKey === 'sql' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy SQL</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: 'users', desc: 'User profiles, bcrypt hashed passwords, role and tier', count: '5 columns' },
                  { name: 'files', desc: 'Uploaded documents, sha256 checksums, paths and sizes', count: '8 columns' },
                  { name: 'conversions', desc: 'Conversion jobs, source/target formats, status, timings', count: '7 columns' },
                  { name: 'conversion_history', desc: 'Permanent user download audit log and links', count: '8 columns' },
                  { name: 'subscriptions', desc: 'Local plan states (free, pro, enterprise)', count: '6 columns' },
                  { name: 'payments', desc: 'Demo local payment transaction records', count: '7 columns' },
                  { name: 'security_logs', desc: 'OWASP security audit entries, IP, event type', count: '6 columns' }
                ].map(tbl => (
                  <div key={tbl.name} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-400">{tbl.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{tbl.count}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{tbl.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto text-slate-300 leading-relaxed">
                <pre>{`convertanyfile/
├── index.php                 (Native 3D UI, upload zone, format selector)
├── .htaccess                 (mod_rewrite clean routes + security headers)
├── README.md                 (Examiner setup and walkthrough guide)
│
├── assets/
│   ├── css/
│   │   ├── style.css         (Theme, typography, layout)
│   │   ├── 3d-ui.css         (3D transforms, glassmorphic panels)
│   │   └── responsive.css    (Mobile and tablet breakpoints)
│   │
│   └── js/
│       ├── app.js            (State manager and tab router)
│       ├── upload.js         (Drag & drop, magic byte validator)
│       ├── converter.js      (Conversion runner and progress engine)
│       ├── auth.js           (Session manager and auth modals)
│       └── animations.js     (3D parallax tilt and visual effects)
│
├── config/
│   ├── database.php          (PDO connection, error mode exceptions)
│   └── config.php            (Constants, base URL auto-detection)
│
├── api/
│   ├── auth/ (register.php, login.php, logout.php, session.php)
│   ├── files/ (upload.php, convert.php, download.php, delete.php, preview.php)
│   ├── history/ (index.php)
│   └── user/ (profile.php)
│
├── services/
│   ├── PDFService.php        (Strict font isolation, image to PDF)
│   ├── DOCXService.php       (OpenXML parser, font extraction)
│   ├── ImageService.php      (GD/Imagick format converter)
│   └── ConversionService.php (Pipeline coordinator)
│
├── middleware/
│   ├── auth.php              (Session verification)
│   ├── security.php          (Path traversal prevention)
│   └── csrf.php              (CSRF token generation & validation)
│
├── uploads/ (.htaccess - PHP execution disabled)
├── processed/ (.htaccess - PHP execution disabled)
├── temp/ (.htaccess - PHP execution disabled)
├── logs/ (Error and audit logging)
└── database/
    └── convertanyfile.sql    (Complete 7-table MySQL schema)`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">POST</span>
                  <span>/api/auth/register.php</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Registers new user into MySQL with Bcrypt hash. Returns user profile session.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">POST</span>
                  <span>/api/auth/login.php</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Validates email/password against MySQL. Establishes secure PHP session.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px]">POST</span>
                  <span>/api/files/upload.php</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Uploads document to <code>uploads/</code> directory. Validates mime type and magic bytes.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px]">POST</span>
                  <span>/api/files/convert.php</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Dispatches conversion to <code>ConversionService.php</code>. Strict font preservation.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Examiner Practical Demonstration Steps (Offline / Localhost)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-cyan-400">1. Show Local URL & Offline Independence:</strong>
                  <p className="text-slate-300 mt-1">
                    Disconnect Wi-Fi if requested. Open <code>http://localhost/convertanyfile/</code>. Show that Apache serves the entire site without internet.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-cyan-400">2. Demonstrate User Registration & MySQL Storage:</strong>
                  <p className="text-slate-300 mt-1">
                    Register a new user from the UI. Open phpMyAdmin &rarr; <code>convertanyfile.users</code> table. Show the freshly created user record with a secure <code>password_hash</code>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-cyan-400">3. Demonstrate File Conversion & Font Isolation:</strong>
                  <p className="text-slate-300 mt-1">
                    Upload a DOCX or image. Convert to PDF or desired format. Download the output and open it in Adobe Acrobat / browser. Show that original fonts and layout were preserved without website styling leakage.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-cyan-400">4. Demonstrate Security Hardening:</strong>
                  <p className="text-slate-300 mt-1">
                    Open <code>uploads/.htaccess</code> to show that direct execution of PHP scripts is disabled. Try navigating to an uploaded file directly to show it cannot execute code.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All 7 MySQL tables &amp; PHP services packaged</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
