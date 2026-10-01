<?php
/**
 * ConvertAnyFile - CSRF Protection Middleware
 */

require_once __DIR__ . '/../config/config.php';

class CsrfMiddleware {
    /**
     * Generate or retrieve current CSRF token
     */
    public static function getToken(): string {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    /**
     * Validate request CSRF token
     */
    public static function validate(): bool {
        // Safe methods don't require CSRF validation
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if (in_array($method, ['GET', 'HEAD', 'OPTIONS'])) {
            return true;
        }

        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_POST['csrf_token'] ?? '';
        $sessionToken = $_SESSION['csrf_token'] ?? '';

        if (empty($token) || empty($sessionToken)) {
            return false;
        }

        return hash_equals($sessionToken, $token);
    }
}
