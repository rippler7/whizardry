<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle Preflight CORS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db.php';

try {
    $stmt = $pdo->query("SELECT * FROM questions");
    $questions = $stmt->fetchAll();
    echo json_encode($questions);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
?>