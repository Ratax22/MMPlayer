<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$filename = $data['filename'] ?? '';
$rotation = $data['rotation'] ?? '0';
$scaleX = $data['scaleX'] ?? '0';
$scaleY = $data['scaleY'] ?? '0';

if (empty($filename)) {
    echo json_encode(['message' => 'Nombre de archivo no proporcionado']);
    exit;
}

$settingsFile = '../Multimedia/Videos/settings.txt';
$settings = file_exists($settingsFile) ? json_decode(file_get_contents($settingsFile), true) : [];

$settings[$filename] = [
    'rotation' => $rotation,
    'scaleX' => $scaleX,
    'scaleY' => $scaleY,
];

file_put_contents($settingsFile, json_encode($settings));

echo json_encode(['message' => 'Configuración guardada correctamente']);
?>