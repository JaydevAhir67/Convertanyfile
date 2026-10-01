<?php
/**
 * ConvertAnyFile - File Preview Stream API (Inline PDF / Image)
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/security.php';

$jobUuid = trim($_GET['job'] ?? '');

if (empty($jobUuid)) {
    http_response_code(400);
    die("Missing job identifier.");
}

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare("SELECT * FROM conversions WHERE job_uuid = :uuid AND status = 'completed' LIMIT 1");
    $stmt->execute([':uuid' => $jobUuid]);
    $job = $stmt->fetch();

    if (!$job || empty($job['output_stored_filename'])) {
        http_response_code(404);
        die("File not found.");
    }

    $filePath = PROCESSED_DIR . '/' . basename($job['output_stored_filename']);
    if (!file_exists($filePath)) {
        http_response_code(404);
        die("File missing from disk.");
    }

    $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';

    if (ob_get_level()) {
        ob_end_clean();
    }

    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: inline; filename="' . basename($job['output_original_filename']) . '"');
    header('Content-Length: ' . filesize($filePath));
    header('X-Content-Type-Options: nosniff');

    readfile($filePath);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    die("Preview error: " . $e->getMessage());
}
