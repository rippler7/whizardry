<?php
$host = '127.0.0.1'; // Force TCP connection. Replace with your z.com Remote IP when testing locally!
$db   = 'vdazlbfz_whizardy'; // Your z.com database name
$user = 'vdazlbfz_whizkid'; // Your z.com database username
$pass = 'wRn0^~p8x@MQJ^sp'; // Your z.com database password
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false, // Crucial for preventing SQL Injection
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     http_response_code(500);
     echo json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
     exit();
}
?>