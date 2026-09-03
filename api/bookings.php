<?php
// ==========================================
// API QUẢN LÝ LỊCH HẸN (GET, POST, PUT /api/bookings.php)
// ==========================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../config/db.php';

$pdo = getPDOConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Tự động cập nhật trạng thái ca hẹn theo giờ
autoUpdateBookingStatusByTime($pdo);

switch ($method) {
    case 'GET':
        handleGetBookings($pdo);
        break;

    case 'POST':
        handleCreateBooking($pdo);
        break;

    case 'PUT':
        handleUpdateBooking($pdo);
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Phương thức HTTP không hỗ trợ']);
        break;
}

// ------------------------------------------
// 1. GET: Lấy danh sách lịch hẹn
// ------------------------------------------
function handleGetBookings($pdo) {
    try {
        $code = $_GET['code'] ?? null;
        $phone = $_GET['phone'] ?? null;
        $status = $_GET['status'] ?? null;
        $staff = $_GET['staff'] ?? null;

        $sql = "SELECT * FROM bookings WHERE 1=1";
        $params = [];

        if ($code) {
            $sql .= " AND code = :code";
            $params[':code'] = $code;
        }
        if ($phone) {
            $sql .= " AND customer_phone = :phone";
            $params[':phone'] = $phone;
        }
        if ($status && $status !== 'ALL') {
            $sql .= " AND status = :status";
            $params[':status'] = $status;
        }
        if ($staff && $staff !== 'ALL') {
            $sql .= " AND staff_name LIKE :staff";
            $params[':staff'] = '%' . $staff . '%';
        }

        $sql .= " ORDER BY id DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $bookings = $stmt->fetchAll();

        // Chuẩn hóa tên trường key JSON giống định dạng JS
        $formattedBookings = array_map(function($b) {
            return [
                'code'         => $b['code'],
                'customerName' => $b['customer_name'],
                'customerPhone'=> $b['customer_phone'],
                'serviceName'  => $b['service_name'],
                'servicePrice' => (int)$b['service_price'],
                'date'         => $b['booking_date'],
                'time'         => $b['booking_time'],
                'staff'        => $b['staff_name'],
                'note'         => $b['note'],
                'status'       => $b['status'],
                'createdAt'    => $b['created_at']
            ];
        }, $bookings);

        echo json_encode([
            'status' => 'success',
            'data' => $formattedBookings
        ], JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// ------------------------------------------
// 2. POST: Đặt lịch hẹn mới
// ------------------------------------------
function handleCreateBooking($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            $input = $_POST;
        }

        $customerName = trim($input['customerName'] ?? '');
        $customerPhone = trim($input['customerPhone'] ?? '');
        $serviceName = trim($input['serviceName'] ?? 'Gội Đầu Dưỡng Sinh Thảo Dược');
        $servicePrice = intval($input['servicePrice'] ?? 199000);
        $bookingDate = $input['date'] ?? date('Y-m-d');
        $bookingTime = $input['time'] ?? '09:30';
        $staffName = $input['staff'] ?? 'Hệ thống tự xếp KTV';
        $note = trim($input['note'] ?? '');

        if (empty($customerName) || empty($customerPhone)) {
            echo json_encode(['status' => 'error', 'message' => 'Vui lòng điền Họ tên và Số điện thoại']);
            return;
        }

        // Sinh mã đơn AURA-XXXX độc nhất
        $code = generateUniqueCode($pdo);

        $sql = "INSERT INTO bookings (code, customer_name, customer_phone, service_name, service_price, booking_date, booking_time, staff_name, note, status)
                VALUES (:code, :customer_name, :customer_phone, :service_name, :service_price, :booking_date, :booking_time, :staff_name, :note, 'Pending')";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':code'           => $code,
            ':customer_name'  => $customerName,
            ':customer_phone' => $customerPhone,
            ':service_name'   => $serviceName,
            ':service_price'  => $servicePrice,
            ':booking_date'   => $bookingDate,
            ':booking_time'   => $bookingTime,
            ':staff_name'     => $staffName,
            ':note'           => $note
        ]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Đặt lịch hẹn thành công!',
            'data' => [
                'code'          => $code,
                'customerName'  => $customerName,
                'customerPhone' => $customerPhone,
                'serviceName'   => $serviceName,
                'servicePrice'  => $servicePrice,
                'date'          => $bookingDate,
                'time'          => $bookingTime,
                'staff'         => $staffName,
                'note'          => $note,
                'status'        => 'Pending'
            ]
        ], JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Lỗi tạo lịch hẹn: ' . $e->getMessage()]);
    }
}

// ------------------------------------------
// 3. PUT: Cập nhật trạng thái / Đổi KTV
// ------------------------------------------
function handleUpdateBooking($pdo) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        $code = $input['code'] ?? null;
        $status = $input['status'] ?? null;
        $staff = $input['staff'] ?? null;
        $note = $input['note'] ?? null;

        if (!$code) {
            echo json_encode(['status' => 'error', 'message' => 'Thiếu Mã đơn']);
            return;
        }

        $fields = [];
        $params = [':code' => $code];

        if ($status) {
            $fields[] = "status = :status";
            $params[':status'] = $status;
        }
        if ($staff) {
            $fields[] = "staff_name = :staff";
            $params[':staff'] = $staff;
        }
        if ($note !== null) {
            $fields[] = "note = CONCAT(IFNULL(note, ''), ' ', :note)";
            $params[':note'] = $note;
        }

        if (empty($fields)) {
            echo json_encode(['status' => 'error', 'message' => 'Không có dữ liệu cần cập nhật']);
            return;
        }

        $sql = "UPDATE bookings SET " . implode(', ', $fields) . " WHERE code = :code";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(['status' => 'success', 'message' => 'Đã cập nhật lịch hẹn thành công']);

    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// Helper: Sinh mã đơn độc nhất
function generateUniqueCode($pdo) {
    do {
        $code = 'AURA-' . rand(1000, 9999);
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM bookings WHERE code = :code");
        $stmt->execute([':code' => $code]);
        $exists = $stmt->fetchColumn() > 0;
    } while ($exists);

    return $code;
}

// Helper: Tự động chuyển trạng thái ca hẹn theo giờ
function autoUpdateBookingStatusByTime($pdo) {
    try {
        // Confirmed -> In_Progress khi đến giờ hẹn
        $pdo->exec("UPDATE bookings SET status = 'In_Progress' 
                    WHERE status = 'Confirmed' 
                    AND booking_date = CURDATE() 
                    AND STR_TO_DATE(booking_time, '%H:%i') <= TIME(NOW())");

        // In_Progress / Confirmed -> Completed sau 1 tiếng
        $pdo->exec("UPDATE bookings SET status = 'Completed' 
                    WHERE status IN ('Confirmed', 'In_Progress') 
                    AND (booking_date < CURDATE() OR (booking_date = CURDATE() AND ADDTIME(STR_TO_DATE(booking_time, '%H:%i'), '01:00:00') <= TIME(NOW())))");
    } catch (Exception $e) {
        // Swallowed silently
    }
}
