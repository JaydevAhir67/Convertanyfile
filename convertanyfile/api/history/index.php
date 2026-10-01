<?php
/**
 * ConvertAnyFile - Conversion History API
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../middleware/security.php';

SecurityMiddleware::applyHeaders();

$currentUser = AuthMiddleware::getCurrentUser();
$userId = $currentUser ? $currentUser['id'] : null;

try {
    $pdo = Database::getConnection();

    if ($userId) {
        $stmt = $pdo->prepare("
            SELECT * FROM conversion_history
            WHERE user_id = :uid
            ORDER BY created_at DESC
            LIMIT 50
        ");
        $stmt->execute([':uid' => $userId]);
    } else {
        // Return latest public/demo session records
        $stmt = $pdo->query("
            SELECT * FROM conversion_history
            ORDER BY created_at DESC
            LIMIT 20
        ");
    }

    $history = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'count'   => count($history),
        'history' => $history
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
