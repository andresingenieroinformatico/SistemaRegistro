<?php
require_once '../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['nombre']) || empty($data['correo']) || empty($data['password'])) {
        echo json_encode(['error' => 'Todos los campos son obligatorios.']);
        exit;
    }

    $nombre = $data['nombre'];
    $correo = $data['correo'];
    $password = password_hash($data['password'], PASSWORD_BCRYPT);

    try {
        // Check if email exists
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ?");
        $stmt->execute([$correo]);
        if ($stmt->fetch()) {
            echo json_encode(['error' => 'El correo ya está registrado.']);
            exit;
        }

        // Insert new user
        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)");
        $stmt->execute([$nombre, $correo, $password]);

        echo json_encode(['message' => 'Usuario registrado con éxito.']);
    } catch (\Exception $e) {
        echo json_encode(['error' => 'Error al registrar: ' . $e->getMessage()]);
    }
}
?>
