<?php
header('Content-Type: application/json');

$videoDir = '../Multimedia/Videos/';
$videos = glob($videoDir . '*.{mp4,webm,ogg}', GLOB_BRACE);

if (empty($videos)) {
    echo json_encode([]);
    exit;
}

$videoFiles = array_map('basename', $videos);
echo json_encode($videoFiles);
?>