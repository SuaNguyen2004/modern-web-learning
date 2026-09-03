<?php
// ==========================================
// AURA SPA - AUTO DATABASE INSTALLER & SEEDER
// ==========================================

header('Content-Type: text/html; charset=utf-8');

$host = 'localhost';
$user = 'root';
$pass = '';
$sqlFile = __DIR__ . '/database/schema.sql';

echo "<h2>🌸 AuraSpa Database Auto Setup</h2>";

if (!file_exists($sqlFile)) {
    die("<p style='color:red;'>❌ Thất bại: Không tìm thấy file script SQL tại $sqlFile</p>");
}

try {
    // 1. Kết nối MySQL không cần chỉ định Database trước
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    echo "<p style='color:green;'>✓ Kết nối MySQL thành công!</p>";

    // 2. Đọc file schema.sql
    $sqlContent = file_get_contents($sqlFile);

    // 3. Thực thi toàn bộ lệnh SQL trong file schema.sql
    $pdo->exec($sqlContent);

    echo "<div style='background:#f0fdf4; border:1px solid #bbf7d0; padding:15px; border-radius:12px; font-family:sans-serif;'>";
    echo "<h3 style='color:#166534; margin-top:0;'>🎉 KHỞI TẠO CSDL MYSQL THÀNH CÔNG!</h3>";
    echo "<ul>";
    echo "<li>Cơ sở dữ liệu: <strong>auraspa_db</strong></li>";
    echo "<li>Đã khởi tạo 6 Bảng: <code>services</code>, <code>staff</code>, <code>customers</code>, <code>bookings</code>, <code>vouchers</code>, <code>chat_messages</code></li>";
    echo "<li>Đã thêm sẵn dữ liệu mẫu cho Dịch vụ, KTV, Khách VIP và Lịch hẹn!</li>";
    echo "</ul>";
    echo "<p><a href='index.html' style='background:#e11d48; color:white; padding:10px 20px; text-decoration:none; border-radius:20px; font-weight:bold;'>👉 Đến Trang Chủ Website</a></p>";
    echo "</div>";

} catch (PDOException $e) {
    echo "<div style='background:#fef2f2; border:1px solid #fecaca; padding:15px; border-radius:12px; font-family:sans-serif;'>";
    echo "<h3 style='color:#991b1b; margin-top:0;'>❌ LỖI KHỞI TẠO CSDL</h3>";
    echo "<p>" . $e->getMessage() . "</p>";
    echo "</div>";
}
