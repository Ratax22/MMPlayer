<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$filename = $data['filename'] ?? '';

if (empty($filename)) {
    echo json_encode(['message' => 'Nombre de archivo no proporcionado']);
    exit;
}

$filePath = '../Multimedia/Videos/' . $filename;

if (!file_exists($filePath)) {
    echo json_encode(['message' => 'El archivo no existe']);
    exit;
}

if (!unlink($filePath)) {
    echo json_encode(['message' => 'Error al eliminar el archivo']);
    exit;
}

echo json_encode(['message' => 'Archivo eliminado correctamente']);
?>