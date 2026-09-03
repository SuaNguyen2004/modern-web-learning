-- ==========================================
-- AURA SPA DATABASE SCHEMA (MYSQL 8.0 / MARIADB)
-- DATABASE NAME: auraspa_db
-- ==========================================

CREATE DATABASE IF NOT EXISTS `auraspa_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `auraspa_db`;

-- 1. BẢNG DỊCH VỤ SPA (services)
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `price` INT NOT NULL,
    `duration` VARCHAR(50) NOT NULL,
    `description` TEXT,
    `image_url` VARCHAR(500),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG KỸ THUẬT VIÊN (staff)
DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL,
    `rating` DECIMAL(3,1) DEFAULT 5.0,
    `reviews_count` INT DEFAULT 0,
    `avatar_url` VARCHAR(500),
    `status` ENUM('Available', 'Busy', 'Off') DEFAULT 'Available',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG KHÁCH HÀNG (customers)
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL UNIQUE,
    `email` VARCHAR(255),
    `rank_name` VARCHAR(100) DEFAULT 'Thành Viên Vàng (Gold Member)',
    `rank_badge` VARCHAR(50) DEFAULT '👑 VIP GOLD',
    `points` INT DEFAULT 1250,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG LỊCH HẸN (bookings)
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(50) NOT NULL UNIQUE,
    `customer_name` VARCHAR(255) NOT NULL,
    `customer_phone` VARCHAR(20) NOT NULL,
    `service_name` VARCHAR(255) NOT NULL,
    `service_price` INT NOT NULL,
    `booking_date` DATE NOT NULL,
    `booking_time` VARCHAR(10) NOT NULL,
    `staff_name` VARCHAR(255) DEFAULT 'Hệ thống tự xếp KTV',
    `note` TEXT,
    `status` ENUM('Pending', 'Confirmed', 'In_Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG VOUCHER & ƯU ĐÃI (vouchers)
DROP TABLE IF EXISTS `vouchers`;
CREATE TABLE `vouchers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(50) NOT NULL UNIQUE,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `discount_text` VARCHAR(100) NOT NULL,
    `expiry` VARCHAR(50) NOT NULL,
    `min_spend` VARCHAR(100) DEFAULT '0 đ',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BẢNG CHAT TRỰC TUYẾN (chat_messages)
DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sender` ENUM('customer', 'spa') NOT NULL,
    `sender_name` VARCHAR(255) NOT NULL,
    `message_text` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- SEED DỮ LIỆU BAN ĐẦU (INITIAL SEED DATA)
-- ==========================================

-- Seed Dịch Vụ
INSERT INTO `services` (`name`, `price`, `duration`, `description`, `image_url`) VALUES
('Gội Đầu Dưỡng Sinh Thảo Dược', 199000, '60 Phút', 'Gội đầu bằng nước bồ kết nấu tươi, massage ấn huyệt da đầu, vòm nước tuần hoàn giúp giảm đau đầu sảng khoái.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef'),
('Chăm Sóc Da Mặt Chuyên Sâu', 350000, '75 Phút', 'Tẩy tế bào chết, hút mụn cám, điện di tinh chất Vitamin C kết hợp đắp mặt nạ sinh học giúp da căng bóng sáng mịn.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881'),
('Massage Cổ Vai Gáy Trị Liệu', 250000, '45 Phút', 'Ấn huyệt chuyên sâu giải tỏa bó cơ vai gáy, chườm đá nóng bazo và thảo dược kết hợp hỗ trợ giấc ngủ ngon.', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874'),
('Combo Chăm Sóc Da & Gội Đầu VIP', 499000, '90 Phút', 'Gói chăm sóc toàn diện: Gội đầu thảo dược + Chăm sóc da C vitamin + Massage cổ vai gáy chườm đá nóng.', 'https://images.unsplash.com/photo-1512290900673-0fb66f5c880c');

-- Seed Kỹ Thuật Viên
INSERT INTO `staff` (`name`, `role`, `rating`, `reviews_count`, `avatar_url`, `status`) VALUES
('Nguyễn Minh Anh', 'Chuyên Gia Chăm Sóc Da', 4.9, 180, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2', 'Available'),
('Trần Thu Hà', 'Chuyên Gia Gội Đầu Dưỡng Sinh', 5.0, 210, 'https://images.unsplash.com/photo-1580489944761-15a19d654956', 'Available'),
('Lê Ngọc Lan', 'KTV Massage Trị Liệu', 4.8, 140, 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604', 'Available');

-- Seed Khách Hàng VIP
INSERT INTO `customers` (`name`, `phone`, `email`, `rank_name`, `rank_badge`, `points`) VALUES
('Nguyễn Thanh Hằng', '0908123456', 'thanhhang.aura@gmail.com', 'Thành Viên Vàng (Gold Member)', '👑 VIP GOLD', 1250);

-- Seed Lịch Hẹn
INSERT INTO `bookings` (`code`, `customer_name`, `customer_phone`, `service_name`, `service_price`, `booking_date`, `booking_time`, `staff_name`, `note`, `status`) VALUES
('AURA-8942', 'Nguyễn Thanh Hằng', '0908123456', 'Chăm Sóc Da Mặt Chuyên Sâu', 350000, CURDATE(), '09:30', 'KTV Nguyễn Minh Anh', 'Da nhạy cảm, dễ mẩn đỏ', 'In_Progress'),
('AURA-5120', 'Trần Hoàng Phương', '0912987654', 'Gội Đầu Dưỡng Sinh Thảo Dược', 199000, CURDATE(), '10:30', 'KTV Trần Thu Hà', '', 'Confirmed'),
('AURA-7731', 'Lê Ngọc Trâm', '0933456789', 'Combo Chăm Sóc Da & Gội Đầu VIP', 499000, CURDATE(), '14:00', 'KTV Lê Ngọc Lan', 'Muốn phòng yên tĩnh', 'Pending'),
('AURA-3309', 'Phạm Bảo Ngọc', '0977112233', 'Massage Cổ Vai Gáy Trị Liệu', 250000, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '16:00', 'KTV Lê Ngọc Lan', '', 'Completed');

-- Seed Vouchers
INSERT INTO `vouchers` (`code`, `title`, `description`, `discount_text`, `expiry`, `min_spend`) VALUES
('AURA100K', 'Giảm 100.000đ Cho Combo VIP 90p', 'Áp dụng cho dịch vụ Combo Chăm Sóc Da & Gội Đầu VIP', '100.000 đ', '30/09/2026', '350.000 đ'),
('SPA20OFF', 'Ưu Đãi 20% Dịch Vụ Gội Đầu Dưỡng Sinh', 'Dành riêng cho khách hàng thân thiết hạng Vàng', 'GIẢM 20%', '15/10/2026', '199.000 đ'),
('SINHNHATVIP', 'Quà Tặng Tri Ân Tháng Sinh Nhật', 'Miễn phí điện di Vitamin C khi đặt dịch vụ Chăm sóc da', 'QUÀ TẶNG VIP', '31/12/2026', '0 đ');

-- Seed Live Chat Ban Đầu
INSERT INTO `chat_messages` (`sender`, `sender_name`, `message_text`) VALUES
('spa', 'Lễ Tân AuraSpa', 'Xin chào bạn! 🌸 AuraSpa có thể hỗ trợ tư vấn dịch vụ gội đầu hay chăm sóc da nào cho bạn hôm nay ạ?');
