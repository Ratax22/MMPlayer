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

// Eliminar la configuración del archivo
$settingsFile = '../Multimedia/Videos/settings.txt';
if (file_exists($settingsFile)) {
    $settings = json_decode(file_get_contents($settingsFile), true);
    if (isset($settings[$filename])) {
        unset($settings[$filename]);
        file_put_contents($settingsFile, json_encode($settings));
    }
}

echo json_encode(['message' => 'Archivo eliminado correctamente']);
?>