<?php
$videoDir = 'Multimedia/Videos/';
$videos = glob($videoDir . '*.{mp4,webm,ogg}', GLOB_BRACE); // Filtra por extensiones de video

if (empty($videos)) {
    http_response_code(404);
    echo json_encode(['error' => 'No se encontraron archivos multimedia.']);
    exit;
}

// Devuelve la lista de videos en formato JSON
echo json_encode(array_map('basename', $videos));
?>