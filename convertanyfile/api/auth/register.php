<?php
/**
 * ConvertAnyFile - User Registration API
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/security.php';

SecurityMiddleware::applyHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$password = trim($input['password'] ?? '');
$name = trim($input['name'] ?? 'User');

if (!$email || strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Valid email and password (minimum 6 characters) are required.']);
    exit;
}

try {
    $pdo = Database::getConnection();

    // Check if user already exists
    $check = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $check->execute([':email' => $email]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'error' => 'An account with this email already exists.']);
        exit;
    }

    // Password Hashing (#70: Argon2id with fallback to Bcrypt)
    $algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
    $passwordHash = password_hash($password, $algo);

    $uuid = bin2hex(random_bytes(16));
    $stmt = $pdo->prepare("
        INSERT INTO users (uuid, email, password_hash, name, role, plan)
        VALUES (:uuid, :email, :hash, :name, 'user', 'free')
    ");
    $stmt->execute([
        ':uuid'  => $uuid,
        ':email' => $email,
        ':hash'  => $passwordHash,
        ':name'  => $name
    ]);

    $userId = (int)$pdo->lastInsertId();
    $_SESSION['user_id'] = $userId;
    session_regenerate_id(true);

    echo json_encode([
        'success' => true,
        'message' => 'Registration successful.',
        'user' => [
            'id'    => $userId,
            'uuid'  => $uuid,
            'email' => $email,
            'name'  => $name,
            'role'  => 'user',
            'plan'  => 'free'
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Registration failed: ' . $e->getMessage()]);
}
