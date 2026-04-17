<?php
require_once '../config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get a single user by ID or list users with optional role/status filters
        try {
            if (!empty($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT id, nombre, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, cedula, edad, fecha, status, role FROM usuarios WHERE id = ?");
                $stmt->execute([intval($_GET['id'])]);
                $user = $stmt->fetch();
                if (!$user) {
                    echo json_encode(['error' => 'Usuario no encontrado.']);
                    exit;
                }
                echo json_encode($user);
                exit;
            }

            $query = "SELECT id, nombre, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, cedula, edad, fecha, status, role FROM usuarios";
            $conditions = [];
            $params = [];

            if (!empty($_GET['role'])) {
                $conditions[] = 'role = ?';
                $params[] = trim($_GET['role']);
            }
            if (!empty($_GET['status'])) {
                $conditions[] = 'status = ?';
                $params[] = trim($_GET['status']);
            }
            if ($conditions) {
                $query .= ' WHERE ' . implode(' AND ', $conditions);
            }
            $query .= ' ORDER BY id DESC';

            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $users = $stmt->fetchAll();
        } catch (\PDOException $e) {
            if (strpos($e->getMessage(), 'Unknown column') !== false && strpos($e->getMessage(), 'role') !== false) {
                $query = "SELECT id, nombre, correo, fecha, status FROM usuarios";
                if (!empty($_GET['status'])) {
                    $query .= " WHERE status = ?";
                    $stmt = $pdo->prepare($query);
                    $stmt->execute([trim($_GET['status'])]);
                } else {
                    $stmt = $pdo->query($query);
                }
                $users = $stmt->fetchAll();
                foreach ($users as &$user) {
                    $user['role'] = 'estudiante';
                }
                unset($user);
            } else {
                echo json_encode(['error' => 'Error al obtener usuarios: ' . $e->getMessage()]);
                exit;
            }
        }

        echo json_encode($users);
        break;

    case 'POST':
        // Create a new user from administrative panel or API client
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['primer_nombre']) || empty($data['primer_apellido']) || empty($data['correo']) || empty($data['password']) || empty($data['edad']) || empty($data['cedula'])) {
            echo json_encode(['error' => 'Primer nombre, primer apellido, correo, contraseña, edad y cédula son obligatorios.']);
            exit;
        }

        $primerNombre = trim($data['primer_nombre']);
        $segundoNombre = trim($data['segundo_nombre'] ?? '');
        $primerApellido = trim($data['primer_apellido']);
        $segundoApellido = trim($data['segundo_apellido'] ?? '');
        $correo = filter_var(trim($data['correo']), FILTER_VALIDATE_EMAIL);
        $rawPassword = trim($data['password']);
        $edad = intval($data['edad']);
        $cedula = trim($data['cedula']);
        $role = in_array($data['role'] ?? 'estudiante', ['docente', 'estudiante']) ? $data['role'] : 'estudiante';

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

        try {
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ? OR cedula = ?");
            $stmt->execute([$correo, $cedula]);
            if ($stmt->fetch()) {
                echo json_encode(['error' => 'El correo o la cédula ya está registrada.']);
                exit;
            }

            $passwordHash = password_hash($rawPassword, PASSWORD_BCRYPT);
            $status = 'Activo';
            $nombre = trim("$primerNombre $segundoNombre $primerApellido $segundoApellido");

            $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo, password, cedula, edad, status, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$nombre, $primerNombre, $segundoNombre ?: null, $primerApellido, $segundoApellido ?: null, $correo, $passwordHash, $cedula, $edad, $status, $role]);

            echo json_encode(['message' => 'Usuario registrado con éxito.']);
        } catch (\Exception $e) {
            echo json_encode(['error' => 'Error al registrar: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Update user profile
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['id']) || empty($data['primer_nombre']) || empty($data['primer_apellido']) || empty($data['correo'])) {
            echo json_encode(['error' => 'ID, primer nombre, primer apellido y correo son obligatorios.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ? AND id != ?");
            $stmt->execute([$data['correo'], $data['id']]);
            if ($stmt->fetch()) {
                echo json_encode(['error' => 'El correo ya está en uso por otro usuario.']);
                exit;
            }

            $role = in_array($data['role'] ?? 'estudiante', ['docente', 'estudiante']) ? $data['role'] : 'estudiante';
            $status = !empty($data['status']) ? trim($data['status']) : 'Activo';
            $nombre = trim(($data['primer_nombre'] ?? '') . ' ' . ($data['segundo_nombre'] ?? '') . ' ' . ($data['primer_apellido'] ?? '') . ' ' . ($data['segundo_apellido'] ?? ''));

            $stmt = $pdo->prepare("UPDATE usuarios SET nombre = ?, primer_nombre = ?, segundo_nombre = ?, primer_apellido = ?, segundo_apellido = ?, correo = ?, cedula = ?, edad = ?, status = ?, role = ? WHERE id = ?");
            $stmt->execute([
                $nombre,
                trim($data['primer_nombre']),
                trim($data['segundo_nombre'] ?? ''),
                trim($data['primer_apellido']),
                trim($data['segundo_apellido'] ?? ''),
                trim($data['correo']),
                trim($data['cedula'] ?? ''),
                intval($data['edad'] ?? 0),
                $status,
                $role,
                $data['id']
            ]);

            echo json_encode(['message' => 'Usuario actualizado con éxito.']);
        } catch (\Exception $e) {
            echo json_encode(['error' => 'Error al actualizar: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete user
        if (empty($_GET['id'])) {
            echo json_encode(['error' => 'ID de usuario es obligatorio.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            echo json_encode(['message' => 'Usuario eliminado con éxito.']);
        } catch (\Exception $e) {
            echo json_encode(['error' => 'Error al eliminar: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['error' => 'Método no soportado.']);
        break;
}
?>
