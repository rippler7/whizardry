<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

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