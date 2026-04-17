<?php
require_once '../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['primer_nombre']) || empty($data['primer_apellido']) || empty($data['correo']) || empty($data['password']) || empty($data['edad']) || empty($data['ocupacion']) || empty($data['cedula'])) {
        echo json_encode(['error' => 'Primer nombre, primer apellido, correo, contraseña, edad, ocupación y cédula son obligatorios.']);
        exit;
    }

    $primerNombre = trim($data['primer_nombre']);
    $segundoNombre = trim($data['segundo_nombre'] ?? '');
    $primerApellido = trim($data['primer_apellido']);
    $segundoApellido = trim($data['segundo_apellido'] ?? '');
    $correo = filter_var(trim($data['correo']), FILTER_VALIDATE_EMAIL);
    $rawPassword = trim($data['password']);
    $edad = intval($data['edad']);
    $ocupacion = trim($data['ocupacion']);
    $cedula = trim($data['cedula']);
    $role = in_array($data['role'] ?? 'estudiante', ['docente', 'estudiante']) ? $data['role'] ?? 'estudiante' : 'estudiante';

    if (!$correo) {
        echo json_encode(['error' => 'El correo no es un email válido.']);
        exit;
    }

    if (strlen($rawPassword) < 8) {
        echo json_encode(['error' => 'La contraseña debe tener al menos 8 caracteres.']);
        exit;
    }

    if ($edad <= 0) {
        echo json_encode(['error' => 'La edad debe ser un número mayor que cero.']);
        exit;
    }

    if (!$cedula) {
        echo json_encode(['error' => 'La cédula es obligatoria.']);
        exit;
    }

    $password = password_hash($rawPassword, PASSWORD_BCRYPT);
    $status = 'Activo';

    $nombre = trim("$primerNombre $segundoNombre $primerApellido $segundoApellido");

    try {
        // Check if email exists
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ?");
        $stmt->execute([$correo]);
        if ($stmt->fetch()) {
            echo json_encode(['error' => 'El correo ya está registrado.']);
            exit;
        }

        // Insert new user with extended profile
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ? OR cedula = ?");
        $stmt->execute([$correo, $cedula]);
        if ($stmt->fetch()) {
            echo json_encode(['error' => 'El correo o la cédula ya está registrada.']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, password, cedula, edad, ocupacion, status, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$nombre, $primerNombre, $segundoNombre ?: null, $primerApellido, $segundoApellido ?: null, $correo, $password, $cedula, $edad, $ocupacion, $status, $role]);

        echo json_encode(['message' => 'Usuario registrado con éxito.']);
    } catch (\Exception $e) {
        echo json_encode(['error' => 'Error al registrar: ' . $e->getMessage()]);
    }
}
?>
