<?php
/**
 * ConvertAnyFile - Core Configuration
 * Compatible with XAMPP Localhost & Production environments
 */

// Application Identification
define('APP_NAME', 'ConvertAnyFile');
define('APP_VERSION', '3.0.0-PRO');

// Auto-detect base URL (e.g. http://localhost/convertanyfile)
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || ($_SERVER['SERVER_PORT'] ?? 80) == 443) ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? ''));
$baseDir = preg_replace('#/(api|assets|middleware|services|config).*#', '', $scriptDir);
$appUrl = rtrim($protocol . $host . $baseDir, '/');

define('APP_URL', $appUrl);

// Storage Directories (Absolute Paths)
define('ROOT_PATH', realpath(__DIR__ . '/..'));
define('UPLOAD_DIR', ROOT_PATH . '/uploads');
define('PROCESSED_DIR', ROOT_PATH . '/processed');
define('TEMP_DIR', ROOT_PATH . '/temp');
define('LOG_DIR', ROOT_PATH . '/logs');

// Storage Limits & File Constraints
define('MAX_FILE_SIZE', 100 * 1024 * 1024); // 100 MB max file size
define('ALLOWED_EXTENSIONS', [
    'pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls',
    'jpg', 'jpeg', 'png', 'webp', 'bmp', 'svg', 'gif',
    'csv', 'json', 'txt', 'md', 'html', 'rtf',
    'mp3', 'wav', 'ogg', 'mp4', 'mov'
]);

// Session Configuration (Strict Security & SameSite)
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Lax');
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        ini_set('session.cookie_secure', 1);
    }
    session_start();
}
