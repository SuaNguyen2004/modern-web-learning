<?php
// ==========================================
// AURA SPA - DATABASE CONNECTION CONFIG (PDO)
// ==========================================

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', ''); // Mặc định Laragon không có mật khẩu
define('DB_NAME', 'auraspa_db');
define('DB_CHARSET', 'utf8mb4');

function getPDOConnection() {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // Trả về lỗi định dạng JSON nếu kết nối thất bại
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'status' => 'error',
                'message' => 'Lỗi kết nối Cơ Sở Dữ Liệu MySQL: ' . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    return $pdo;
}
