<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['message' => 'Método no permitido']);
    exit;
}

if (!isset($_FILES['files'])) {
    echo json_encode(['message' => 'No se recibieron archivos']);
    exit;
}

$uploadDir = "../Multimedia/Videos/";
$output = "";
$successCount = 0;
$errorCount = 0;

foreach ($_FILES['files']['tmp_name'] as $index => $tmpName) {
    $fileName = basename($_FILES['files']['name'][$index]);
    $uploadFile = $uploadDir . $fileName;

    // Verificar si el archivo ya existe
    if (file_exists($uploadFile)) {
        $output .= "El archivo ".$fileName." ya existe.\n";
        $errorCount++;
        continue;
    }

    // Mover el archivo subido a la carpeta de videos
    if (!move_uploaded_file($tmpName, $uploadFile)) {
        $output .= "Error al subir el archivo ".$fileName.".\n";
        $errorCount++;
        continue;
    }

    // Optimizar el video usando FFmpeg
    $optimizedFile = $uploadDir . 'optimized_' . $fileName;
    $ffmpegCommand = "ffmpeg\\bin\\ffmpeg.exe -i ".$uploadFile." -vf \"scale=1280:720\" -vcodec libx264 -crf 23 -preset medium -acodec aac -b:a 128k ".$optimizedFile." 2>&1";
    $ffmpegOutput = shell_exec($ffmpegCommand);

    if ($ffmpegOutput === null) {
        $output .= "Error al optimizar el video ".$fileName.".\n";
        $errorCount++;
        continue;
    }

    // Eliminar el archivo original y renombrar el optimizado
    unlink($uploadFile);
    rename($optimizedFile, $uploadFile);

    $output .= "Video ".$fileName." subido y optimizado correctamente.\n";
    $successCount++;
}

echo json_encode([
    'message' => "Proceso completado: ".$successCount." archivos subidos y optimizados, ".$errorCount." errores.",
    'output' => $output,
]);
?>