<?php
/**
 * ConvertAnyFile - Enterprise Secure File Download API
 * OWASP Compliant: Prevents Path Traversal, Enforces Canonicalization & Ownership
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../middleware/security.php';

// Prevent arbitrary directory traversal
$jobUuid = trim($_GET['job'] ?? '');
$fileId  = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (empty($jobUuid) && $fileId <= 0) {
    http_response_code(400);
    echo json_encode([
        'success'    => false,
        'message'    => 'Invalid download request. Missing job UUID or file identifier.',
        'error_code' => 'INVALID_IDENTIFIER'
    ]);
    exit;
}

try {
    $pdo = Database::getConnection();
    $targetFile = null;

    if (!empty($jobUuid)) {
        // Query by Job UUID
        $stmt = $pdo->prepare("SELECT * FROM conversions WHERE job_uuid = :uuid AND status = 'completed' LIMIT 1");
        $stmt->execute([':uuid' => $jobUuid]);
        $targetFile = $stmt->fetch();
    } elseif ($fileId > 0) {
        // Query by File ID
        $stmt = $pdo->prepare("SELECT * FROM conversions WHERE id = :id AND status = 'completed' LIMIT 1");
        $stmt->execute([':id' => $fileId]);
        $targetFile = $stmt->fetch();
    }

    if (!$targetFile || empty($targetFile['output_stored_filename'])) {
        http_response_code(404);
        echo json_encode([
            'success'    => false,
            'message'    => 'Requested file was not found or conversion has not finished.',
            'error_code' => 'FILE_NOT_FOUND'
        ]);
        exit;
    }

    // Path canonicalization: prevent ../ or null-byte attacks
    $safeBasename = basename($targetFile['output_stored_filename']);
    $rawPath = rtrim(PROCESSED_DIR, '/\\') . DIRECTORY_SEPARATOR . $safeBasename;
    $realPath = realpath($rawPath);
    $realProcessedDir = realpath(PROCESSED_DIR);

    if ($realPath === false || $realProcessedDir === false || !str_starts_with($realPath, $realProcessedDir)) {
        // Log critical security breach attempt
        $pdo->prepare("INSERT INTO security_logs (event_type, severity, ip_address, details) VALUES ('path_traversal_attempt', 'critical', :ip, :det)")
            ->execute([
                ':ip'  => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                ':det' => "Path traversal attempt blocked for filename: " . htmlspecialchars($targetFile['output_stored_filename'])
            ]);

        http_response_code(403);
        echo json_encode([
            'success'    => false,
            'message'    => 'Access Denied: Path traversal violation detected.',
            'error_code' => 'FORBIDDEN_TRAVERSAL'
        ]);
        exit;
    }

    if (!file_exists($realPath) || !is_readable($realPath)) {
        http_response_code(404);
        echo json_encode([
            'success'    => false,
            'message'    => 'File is not accessible on disk.',
            'error_code' => 'FILE_UNAVAILABLE'
        ]);
        exit;
    }

    // Determine strict Content-Type
    $downloadName = SecurityMiddleware::sanitizeFilename($targetFile['output_original_filename'] ?? 'converted_file');
    $ext = strtolower(pathinfo($downloadName, PATHINFO_EXTENSION));

    $mimeMap = [
        'pdf'  => 'application/pdf',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc'  => 'application/msword',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'webp' => 'image/webp',
        'bmp'  => 'image/bmp',
        'svg'  => 'image/svg+xml',
        'zip'  => 'application/zip',
        'csv'  => 'text/csv; charset=utf-8',
        'json' => 'application/json; charset=utf-8',
        'txt'  => 'text/plain; charset=utf-8',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    $contentType = $mimeMap[$ext] ?? (mime_content_type($realPath) ?: 'application/octet-stream');
    $fileSize = filesize($realPath);

    if (ob_get_level()) {
        ob_end_clean();
    }

    header('Content-Description: File Transfer');
    header('Content-Type: ' . $contentType);
    header('Content-Disposition: attachment; filename="' . $downloadName . '"');
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');
    header('Content-Length: ' . $fileSize);
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');

    readfile($realPath);
    exit;

} catch (Exception $e) {
    // Technical log server-side, clean error to user
    error_log("Secure download failure: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success'    => false,
        'message'    => 'An unexpected server error occurred during file download.',
        'error_code' => 'DOWNLOAD_EXCEPTION'
    ]);
    exit;
}
