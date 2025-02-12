<?php
header('Content-Type: application/json');

$settingsFile = '../Multimedia/Videos/settings.txt';

if (!file_exists($settingsFile)) {
    echo json_encode([]);
    exit;
}

$settings = json_decode(file_get_contents($settingsFile), true);
echo json_encode($settings);
?>