<?php
// Database configuration
$host = 'localhost';
$db   = 'sistema_registro';
$user = 'root';
$pass = ''; // Default XAMPP password is empty
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
    \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
    \PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new \PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     header('Content-Type: application/json', true, 500);
     echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
     exit;
}

// Allow CORS (Adjust for production)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

// Ensure role column exists and that an admin user is available.
try {
    $pdo->query("SELECT role FROM usuarios LIMIT 1");
} catch (\PDOException $e) {
    if (strpos($e->getMessage(), 'Unknown column') !== false && strpos($e->getMessage(), 'role') !== false) {
        $pdo->exec("ALTER TABLE usuarios ADD COLUMN role VARCHAR(20) DEFAULT 'user'");
    }
}

$defaultAdminEmail = 'admin@admin.com';
$defaultAdminPassword = 'Admin1234!';
$defaultAdminName = 'Administrador';

try {
    $stmt = $pdo->prepare("SELECT id, role FROM usuarios WHERE correo = ? LIMIT 1");
    $stmt->execute([$defaultAdminEmail]);
    $adminUser = $stmt->fetch();

    if (!$adminUser) {
        $hashedPassword = password_hash($defaultAdminPassword, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, correo, password, status, role) VALUES (?, ?, ?, ?, 'admin')");
        $stmt->execute([$defaultAdminName, $defaultAdminEmail, $hashedPassword, 'Activo']);
    } elseif (empty($adminUser['role']) || $adminUser['role'] !== 'admin') {
        $stmt = $pdo->prepare("UPDATE usuarios SET role = 'admin' WHERE id = ?");
        $stmt->execute([$adminUser['id']]);
    }
} catch (\Exception $e) {
    // Ignore admin bootstrap failures to avoid blocking normal requests.
}
?>
