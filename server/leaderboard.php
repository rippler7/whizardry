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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10");
        $scores = $stmt->fetchAll();
        echo json_encode($scores);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error"]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    // Validate input
    if (!empty($data->playerName) && isset($data->score)) {
        try {
            $stmt = $pdo->prepare("INSERT INTO leaderboard (player_name, score, level, questions_answered, correct_answers, enemies_killed, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$data->playerName, $data->score, $data->level ?? 1, $data->questionsAnswered ?? 0, $data->correctAnswers ?? 0, $data->enemiesKilled ?? 0, $data->difficulty ?? 'easy']);
            http_response_code(201);
            echo json_encode(["message" => "Score saved successfully"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Failed to save score"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid submission data"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>