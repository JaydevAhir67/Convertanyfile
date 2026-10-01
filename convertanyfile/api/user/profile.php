<?php
/**
 * ConvertAnyFile - User Profile API
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../middleware/security.php';

SecurityMiddleware::applyHeaders();

$user = AuthMiddleware::requireAuth();

echo json_encode([
    'success' => true,
    'user'    => $user
]);
