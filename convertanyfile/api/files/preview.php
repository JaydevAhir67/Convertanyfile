<?php
/**
 * ConvertAnyFile - Secure File Preview API (Inline Stream)
 * OWASP Compliant: Prevents Path Traversal, Enforces Strict MIME Types
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/security.php';

$jobUuid = trim($_GET['job'] ?? '');
$fileId  = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (empty($jobUuid) && $fileId <= 0) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode([
        'success'    => false,
        'message'    => 'Missing job or file identifier for preview.',
        'error_code' => 'INVALID_IDENTIFIER'
    ]);
    exit;
}

try {
    $pdo = Database::getConnection();
    $targetFile = null;

    if (!empty($jobUuid)) {
        $stmt = $pdo->prepare("SELECT * FROM conversions WHERE job_uuid = :uuid AND status = 'completed' LIMIT 1");
        $stmt->execute([':uuid' => $jobUuid]);
        $targetFile = $stmt->fetch();
    } elseif ($fileId > 0) {
        $stmt = $pdo->prepare("SELECT * FROM conversions WHERE id = :id AND status = 'completed' LIMIT 1");
        $stmt->execute([':id' => $fileId]);
        $targetFile = $stmt->fetch();
    }

    if (!$targetFile || empty($targetFile['output_stored_filename'])) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
            'success'    => false,
            'message'    => 'Preview not available: File record not found or conversion incomplete.',
            'error_code' => 'FILE_NOT_FOUND'
        ]);
        exit;
    }

    // Path canonicalization
    $safeBasename = basename($targetFile['output_stored_filename']);
    $rawPath = rtrim(PROCESSED_DIR, '/\\') . DIRECTORY_SEPARATOR . $safeBasename;
    $realPath = realpath($rawPath);
    $realProcessedDir = realpath(PROCESSED_DIR);

    if ($realPath === false || $realProcessedDir === false || !str_starts_with($realPath, $realProcessedDir)) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'success'    => false,
            'message'    => 'Access Denied: Path traversal violation detected.',
            'error_code' => 'FORBIDDEN_TRAVERSAL'
        ]);
        exit;
    }

    if (!file_exists($realPath) || !is_readable($realPath)) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
            'success'    => false,
            'message'    => 'File is not accessible on disk.',
            'error_code' => 'FILE_UNAVAILABLE'
        ]);
        exit;
    }

    $previewName = SecurityMiddleware::sanitizeFilename($targetFile['output_original_filename'] ?? 'preview_file');
    $ext = strtolower(pathinfo($previewName, PATHINFO_EXTENSION));

    $mimeMap = [
        'pdf'  => 'application/pdf',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'webp' => 'image/webp',
        'bmp'  => 'image/bmp',
        'svg'  => 'image/svg+xml',
        'txt'  => 'text/plain; charset=utf-8',
        'csv'  => 'text/plain; charset=utf-8',
        'json' => 'application/json; charset=utf-8'
    ];

    $contentType = $mimeMap[$ext] ?? (mime_content_type($realPath) ?: 'application/octet-stream');
    $fileSize = filesize($realPath);

    if (ob_get_level()) {
        ob_end_clean();
    }

    header('Content-Type: ' . $contentType);
    header('Content-Disposition: inline; filename="' . $previewName . '"');
    header('Content-Length: ' . $fileSize);
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Cache-Control: public, max-age=3600');

    readfile($realPath);
    exit;

} catch (Exception $e) {
    error_log("Secure preview failure: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success'    => false,
        'message'    => 'An unexpected server error occurred during file preview.',
        'error_code' => 'PREVIEW_EXCEPTION'
    ]);
    exit;
}
