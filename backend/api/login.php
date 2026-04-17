<?php
require_once '../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['correo']) || empty($data['password'])) {
        echo json_encode(['error' => 'Correo y contraseña son obligatorios.']);
        exit;
    }

    $correo = $data['correo'];
    $password = $data['password'];

    try {
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE correo = ?");
        $stmt->execute([$correo]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Don't send the password back to the client
            unset($user['password']);
            echo json_encode(['message' => 'Login exitoso', 'user' => $user]);
        } else {
            echo json_encode(['error' => 'Credenciales inválidas.']);
        }
    } catch (\Exception $e) {
        echo json_encode(['error' => 'Error en el servidor: ' . $e->getMessage()]);
    }
}
?>
