<?php
require_once '../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['nombre']) || empty($data['correo']) || empty($data['password'])) {
        echo json_encode(['error' => 'Todos los campos son obligatorios.']);
        exit;
    }

    $nombre = trim($data['nombre']);
    $correo = filter_var(trim($data['correo']), FILTER_VALIDATE_EMAIL);
    $rawPassword = trim($data['password']);

    if (!$correo) {
        echo json_encode(['error' => 'El correo no es un email válido.']);
        exit;
    }

    if (strlen($rawPassword) < 8) {
        echo json_encode(['error' => 'La contraseña debe tener al menos 8 caracteres.']);
        exit;
    }

    $password = password_hash($rawPassword, PASSWORD_BCRYPT);
    $status = 'Activo';

    try {
        // Check if email exists
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ?");
        $stmt->execute([$correo]);
        if ($stmt->fetch()) {
            echo json_encode(['error' => 'El correo ya está registrado.']);
            exit;
        }

        // Insert new normal user
        try {
            $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, correo, password, status, role) VALUES (?, ?, ?, ?, 'user')");
            $stmt->execute([$nombre, $correo, $password, $status]);
        } catch (\PDOException $e) {
            if (strpos($e->getMessage(), 'Unknown column') !== false && strpos($e->getMessage(), 'role') !== false) {
                $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, correo, password, status) VALUES (?, ?, ?, ?)");
                $stmt->execute([$nombre, $correo, $password, $status]);
            } else {
                throw $e;
            }
        }

        echo json_encode(['message' => 'Usuario registrado con éxito.']);
    } catch (\Exception $e) {
        echo json_encode(['error' => 'Error al registrar: ' . $e->getMessage()]);
    }
}
?>
