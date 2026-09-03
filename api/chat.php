<?php
// ==========================================
// API CHAT TRỰC TUYẾN (GET, POST /api/chat.php)
// ==========================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../config/db.php';

$pdo = getPDOConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT *, DATE_FORMAT(created_at, '%H:%i') as time FROM chat_messages ORDER BY id ASC");
        $messages = $stmt->fetchAll();

        echo json_encode([
            'status' => 'success',
            'data' => $messages
        ], JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            $input = $_POST;
        }

        $sender = $input['sender'] ?? 'customer';
        $senderName = $input['senderName'] ?? ($sender === 'spa' ? 'Lễ Tân AuraSpa' : 'Khách Hàng');
        $text = trim($input['text'] ?? '');

        if (empty($text)) {
            echo json_encode(['status' => 'error', 'message' => 'Nội dung tin nhắn không được để trống']);
            return;
        }

        $stmt = $pdo->prepare("INSERT INTO chat_messages (sender, sender_name, message_text) VALUES (:sender, :sender_name, :text)");
        $stmt->execute([
            ':sender'      => $sender,
            ':sender_name' => $senderName,
            ':text'        => $text
        ]);

        echo json_encode([
            'status' => 'success',
            'data' => [
                'sender'     => $sender,
                'senderName' => $senderName,
                'text'       => $text,
                'time'       => date('H:i')
            ]
        ], JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
