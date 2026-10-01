<?php
/**
 * ConvertAnyFile - User Login API
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
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email and password are required.']);
    exit;
}

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare("SELECT id, uuid, email, password_hash, name, role, plan FROM users WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        // Log security failure
        $pdo->prepare("INSERT INTO security_logs (event_type, severity, ip_address, details) VALUES ('failed_login', 'warning', :ip, :det)")
            ->execute([':ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1', ':det' => "Failed login for email: {$email}"]);

        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid email or password.']);
        exit;
    }

    // Login successful
    $_SESSION['user_id'] = $user['id'];
    session_regenerate_id(true);

    echo json_encode([
        'success' => true,
        'message' => 'Login successful.',
        'user' => [
            'id'    => $user['id'],
            'uuid'  => $user['uuid'],
            'email' => $user['email'],
            'name'  => $user['name'],
            'role'  => $user['role'],
            'plan'  => $user['plan']
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Login error: ' . $e->getMessage()]);
}
