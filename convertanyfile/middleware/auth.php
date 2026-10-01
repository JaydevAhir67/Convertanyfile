<?php
/**
 * ConvertAnyFile - Auth Middleware
 * Enforces session verification and role authorization
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

class AuthMiddleware {
    /**
     * Get the currently authenticated user or null
     */
    public static function getCurrentUser(): ?array {
        if (!isset($_SESSION['user_id'])) {
            return null;
        }

        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("SELECT id, uuid, email, name, role, plan, created_at FROM users WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $_SESSION['user_id']]);
            $user = $stmt->fetch();
            return $user ?: null;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Enforce authentication on protected API endpoints
     */
    public static function requireAuth(): array {
        $user = self::getCurrentUser();
        if (!$user) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'Authentication required. Please log in to access this resource.'
            ]);
            exit;
        }
        return $user;
    }
}
