<?php
/**
 * ConvertAnyFile - File Deletion API
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../middleware/security.php';

SecurityMiddleware::applyHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$jobUuid = trim($input['job_uuid'] ?? '');

if (empty($jobUuid)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'job_uuid is required.']);
    exit;
}

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare("SELECT * FROM conversions WHERE job_uuid = :uuid LIMIT 1");
    $stmt->execute([':uuid' => $jobUuid]);
    $job = $stmt->fetch();

    if ($job && !empty($job['output_stored_filename'])) {
        $filePath = PROCESSED_DIR . '/' . basename($job['output_stored_filename']);
        if (file_exists($filePath)) {
            @unlink($filePath);
        }
    }

    $pdo->prepare("DELETE FROM conversions WHERE job_uuid = :uuid")->execute([':uuid' => $jobUuid]);

    echo json_encode(['success' => true, 'message' => 'Job and file purged successfully.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
