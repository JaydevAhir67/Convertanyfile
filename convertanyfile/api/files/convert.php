<?php
/**
 * ConvertAnyFile - Execute Conversion API
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../middleware/security.php';
require_once __DIR__ . '/../../services/ConversionService.php';

SecurityMiddleware::applyHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$fileId = isset($input['file_id']) ? (int)$input['file_id'] : 0;
$targetFormat = trim($input['target_format'] ?? '');

if ($fileId <= 0 || empty($targetFormat)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'file_id and target_format are required.']);
    exit;
}

$currentUser = AuthMiddleware::getCurrentUser();
$userId = $currentUser ? $currentUser['id'] : null;

try {
    $result = ConversionService::execute($fileId, $targetFormat, $userId);

    echo json_encode([
        'success'    => true,
        'message'    => 'Conversion completed successfully.',
        'conversion' => $result
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
