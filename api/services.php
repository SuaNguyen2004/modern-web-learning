<?php
// ==========================================
// API DỊCH VỤ SPA (GET /api/services.php)
// ==========================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/../config/db.php';

$pdo = getPDOConnection();

try {
    $stmt = $pdo->query("SELECT * FROM services ORDER BY id ASC");
    $services = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'data' => $services
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Lỗi truy vấn Dịch vụ: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
