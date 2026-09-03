<?php
// ==========================================
// API TRANG KHÁCH HÀNG VIP (GET /api/customer.php)
// ==========================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/../config/db.php';

$pdo = getPDOConnection();

try {
    $phone = $_GET['phone'] ?? '0908123456';

    // Lấy thông tin Khách hàng từ DB
    $stmtCust = $pdo->prepare("SELECT * FROM customers WHERE phone = :phone LIMIT 1");
    $stmtCust->execute([':phone' => $phone]);
    $customer = $stmtCust->fetch();

    if (!$customer) {
        $customer = [
            'name' => 'Nguyễn Thanh Hằng',
            'phone' => '0908123456',
            'rank_name' => 'Thành Viên Vàng (Gold Member)',
            'rank_badge' => '👑 VIP GOLD',
            'points' => 1250
        ];
    }

    // Lấy danh sách Voucher từ DB
    $stmtVouchers = $pdo->query("SELECT * FROM vouchers ORDER BY id ASC");
    $vouchers = $stmtVouchers->fetchAll();

    echo json_encode([
        'status' => 'success',
        'customer' => $customer,
        'vouchers' => $vouchers
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
