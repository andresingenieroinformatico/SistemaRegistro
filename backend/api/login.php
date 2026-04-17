<?php
require_once '../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['correo']) || empty($data['password'])) {
        echo json_encode(['error' => 'Correo y contraseña son obligatorios.']);
        exit;
    }

    $correo = filter_var(trim($data['correo']), FILTER_VALIDATE_EMAIL);
    $password = trim($data['password']);

    if (!$correo) {
        echo json_encode(['error' => 'El correo no es un email válido.']);
        exit;
    }

    if (strlen($password) < 6) {
        echo json_encode(['error' => 'La contraseña debe tener al menos 6 caracteres.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE correo = ?");
        $stmt->execute([$correo]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Ensure role is defined for older records
            if (empty($user['role'])) {
                $user['role'] = 'estudiante';
            }
            if ($user['role'] === 'admin') {
                $user['role'] = 'docente';
            }
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
