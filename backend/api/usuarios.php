<?php
require_once '../config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // List all users
        try {
            $stmt = $pdo->query("SELECT id, nombre, correo, fecha, status FROM usuarios ORDER BY id DESC");
            $users = $stmt->fetchAll();
            echo json_encode($users);
        } catch (\Exception $e) {
            echo json_encode(['error' => 'Error al obtener usuarios: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Update user
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['id']) || empty($data['nombre']) || empty($data['correo'])) {
            echo json_encode(['error' => 'ID, Nombre y Correo son obligatorios.']);
            exit;
        }

        try {
            // Check if email is in use by another user
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ? AND id != ?");
            $stmt->execute([$data['correo'], $data['id']]);
            if ($stmt->fetch()) {
                echo json_encode(['error' => 'El correo ya está en uso por otro usuario.']);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?");
            $stmt->execute([$data['nombre'], $data['correo'], $data['id']]);
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
