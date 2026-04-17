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

// Ensure required columns exist and that a default docente user is available.
$requiredColumns = [
    'role' => "VARCHAR(20) DEFAULT 'estudiante'",
    'primer_nombre' => 'VARCHAR(100) NOT NULL DEFAULT ""',
    'segundo_nombre' => 'VARCHAR(100) DEFAULT NULL',
    'primer_apellido' => 'VARCHAR(100) NOT NULL DEFAULT ""',
    'segundo_apellido' => 'VARCHAR(100) DEFAULT NULL',
    'cedula' => 'VARCHAR(50) DEFAULT NULL',
    'edad' => 'INT DEFAULT NULL',
    'ocupacion' => 'VARCHAR(100) DEFAULT NULL',
];

foreach ($requiredColumns as $column => $definition) {
    try {
        $stmt = $pdo->prepare("SHOW COLUMNS FROM usuarios LIKE ?");
        $stmt->execute([$column]);
        if (!$stmt->fetch()) {
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN $column $definition");
        }
    } catch (\PDOException $e) {
        // Ignore errors if table doesn't exist yet or if migration fails.
    }
}

$defaultTeacherEmail = 'docente@docente.com';
$defaultTeacherPassword = 'Docente123!';
$defaultTeacherName = 'Docente Principal';

try {
    $stmt = $pdo->prepare("SELECT id, role FROM usuarios WHERE correo = ? LIMIT 1");
    $stmt->execute([$defaultTeacherEmail]);
    $teacherUser = $stmt->fetch();

    if (!$teacherUser) {
        $hashedPassword = password_hash($defaultTeacherPassword, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, primer_nombre, primer_apellido, correo, password, status, role) VALUES (?, ?, ?, ?, ?, 'Activo', 'docente')");
        $stmt->execute([$defaultTeacherName, 'Docente', 'Principal', $defaultTeacherEmail, $hashedPassword]);
    } elseif (empty($teacherUser['role']) || $teacherUser['role'] !== 'docente') {
        $stmt = $pdo->prepare("UPDATE usuarios SET role = 'docente' WHERE id = ?");
        $stmt->execute([$teacherUser['id']]);
    }
} catch (\Exception $e) {
    // Ignore teacher bootstrap failures to avoid blocking normal requests.
}
?>
