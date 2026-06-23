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

// Map difficulty strings to integer values for the database
$difficultyMap = [
    'easy' => 1,
    'medium' => 2,
    'hard' => 3,
];

$difficulty = null;
if (isset($_GET['difficulty']) && isset($difficultyMap[$_GET['difficulty']])) {
    $difficulty = $difficultyMap[$_GET['difficulty']];
}

try {
    if ($difficulty !== null) {
        $stmt = $pdo->prepare("SELECT * FROM questions WHERE difficulty = ?");
        $stmt->execute([$difficulty]);
    } else {
        // Fallback to fetching all questions if no valid difficulty is provided
        $stmt = $pdo->query("SELECT * FROM questions");
    }
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($questions, JSON_NUMERIC_CHECK);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>