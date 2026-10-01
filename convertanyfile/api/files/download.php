<?php
/**
 * ConvertAnyFile - Secure File Download API
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/security.php';

$jobUuid = trim($_GET['job'] ?? '');

if (empty($jobUuid)) {
    http_response_code(400);
    die("Error: Missing job identifier.");
}

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare("SELECT * FROM conversions WHERE job_uuid = :uuid AND status = 'completed' LIMIT 1");
    $stmt->execute([':uuid' => $jobUuid]);
    $job = $stmt->fetch();

    if (!$job || empty($job['output_stored_filename'])) {
        http_response_code(404);
        die("Error: Requested file not found or conversion has not finished.");
    }

    $filePath = PROCESSED_DIR . '/' . basename($job['output_stored_filename']);
    if (!file_exists($filePath)) {
        http_response_code(404);
        die("Error: Processed file is missing from disk.");
    }

    $filename = SecurityMiddleware::sanitizeFilename($job['output_original_filename'] ?? 'converted_document');
    $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';
    $fileSize = filesize($filePath);

    // Clean buffer
    if (ob_get_level()) {
        ob_end_clean();
    }

    header('Content-Description: File Transfer');
    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . $fileSize);
    header('X-Content-Type-Options: nosniff');

    readfile($filePath);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    die("Download error: " . htmlspecialchars($e->getMessage()));
}
