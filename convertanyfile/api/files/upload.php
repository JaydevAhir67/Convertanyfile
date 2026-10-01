<?php
/**
 * ConvertAnyFile - Secure File Upload API
 * Enforces magic-byte check, size limits, randomized filenames, and SHA-256 integrity
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

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    $errCode = $_FILES['file']['error'] ?? 'missing';
    echo json_encode(['success' => false, 'error' => "File upload failed with error code: {$errCode}"]);
    exit;
}

$uploadedFile = $_FILES['file'];

// Check file size
if ($uploadedFile['size'] > MAX_FILE_SIZE) {
    http_response_code(413);
    echo json_encode(['success' => false, 'error' => 'File size exceeds 100 MB limit.']);
    exit;
}

$originalName = SecurityMiddleware::sanitizeFilename($uploadedFile['name']);
$pathInfo = pathinfo($originalName);
$extension = strtolower($pathInfo['extension'] ?? '');

if (!in_array($extension, ALLOWED_EXTENSIONS)) {
    http_response_code(415);
    echo json_encode(['success' => false, 'error' => "File type '.{$extension}' is not supported."]);
    exit;
}

// Magic bytes verification
if (!SecurityMiddleware::verifyMagicBytes($uploadedFile['tmp_name'], $extension)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File header does not match expected format or contains malicious executable code.']);
    exit;
}

// Ensure uploads directory exists
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

// Generate randomized storage filename
$storedFilename = SecurityMiddleware::generateSecureFilename($extension);
$destination = UPLOAD_DIR . '/' . $storedFilename;

if (!move_uploaded_file($uploadedFile['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file to secure storage.']);
    exit;
}

// Calculate SHA-256 integrity hash
$sha256 = SecurityMiddleware::calculateSha256($destination);
$fileUuid = bin2hex(random_bytes(16));
$mimeType = mime_content_type($destination) ?: 'application/octet-stream';
$fileSize = filesize($destination);

$currentUser = AuthMiddleware::getCurrentUser();
$userId = $currentUser ? $currentUser['id'] : null;

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare("
        INSERT INTO files (file_uuid, user_id, original_filename, stored_filename, mime_type, extension, file_size, sha256)
        VALUES (:uuid, :uid, :orig, :stored, :mime, :ext, :size, :sha)
    ");
    $stmt->execute([
        ':uuid'   => $fileUuid,
        ':uid'    => $userId,
        ':orig'   => $originalName,
        ':stored' => $storedFilename,
        ':mime'   => $mimeType,
        ':ext'    => $extension,
        ':size'   => $fileSize,
        ':sha'    => $sha256
    ]);

    $fileId = (int)$pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'File uploaded and verified successfully.',
        'file' => [
            'id'                => $fileId,
            'file_uuid'         => $fileUuid,
            'original_filename' => $originalName,
            'file_size'         => $fileSize,
            'extension'         => $extension,
            'sha256'            => $sha256
        ]
    ]);
} catch (Exception $e) {
    @unlink($destination);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database record creation failed: ' . $e->getMessage()]);
}
