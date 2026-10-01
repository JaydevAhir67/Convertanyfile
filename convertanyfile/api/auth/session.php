<?php
/**
 * ConvertAnyFile - Session State Verification API
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../middleware/security.php';

SecurityMiddleware::applyHeaders();

$user = AuthMiddleware::getCurrentUser();

if ($user) {
    echo json_encode([
        'authenticated' => true,
        'user' => $user
    ]);
} else {
    echo json_encode([
        'authenticated' => false,
        'user' => null
    ]);
}
