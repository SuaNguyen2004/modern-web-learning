// ==========================================
// SPA ADMIN & STAFF DASHBOARD SCRIPT
// ==========================================

// Dữ liệu mẫu ban đầu nếu localStorage chưa có dữ liệu
const INITIAL_DUMMY_BOOKINGS = [
    {
        code: 'AURA-8942',
        customerName: 'Nguyễn Thanh Hằng',
        customerPhone: '0908123456',
        serviceName: 'Chăm Sóc Da Mặt Chuyên Sâu',
        servicePrice: 350000,
        date: '2026-09-03',
        time: '09:30',
        staff: 'KTV Nguyễn Minh Anh',
        note: 'Da nhạy cảm, dễ mẩn đỏ',
        status: 'In_Progress',
        createdAt: '03/09/2026 09:10'
    },
    {
        code: 'AURA-5120',
        customerName: 'Trần Hoàng Phương',
        customerPhone: '0912987654',
        serviceName: 'Gội Đầu Dưỡng Sinh Thảo Dược',
        servicePrice: 199000,
        date: '2026-09-03',
        time: '10:30',
        staff: 'KTV Trần Thu Hà',
        note: '',
        status: 'Confirmed',
        createdAt: '03/09/2026 09:45'
    },
    {
        code: 'AURA-7731',
        customerName: 'Lê Ngọc Trâm',
        customerPhone: '0933456789',
        serviceName: 'Combo Chăm Sóc Da & Gội Đầu VIP',
        servicePrice: 499000,
        date: '2026-09-03',
        time: '14:00',
        staff: 'KTV Lê Ngọc Lan',
        note: 'Muốn phòng yên tĩnh',
        status: 'Pending',
        createdAt: '03/09/2026 10:15'
    },
    {
        code: 'AURA-3309',
        customerName: 'Phạm Bảo Ngọc',
        customerPhone: '0977112233',
        serviceName: 'Massage Cổ Vai Gáy Trị Liệu',
        servicePrice: 250000,
        date: '2026-09-02',
        time: '16:00',
        staff: 'KTV Lê Ngọc Lan',
        note: '',
        status: 'Completed',
        createdAt: '02/09/2026 15:00'
    }
];

// Danh sách KTV mẫu để đổi ca
const ALL_STAFF_LIST = [
    'KTV Nguyễn Minh Anh',
    'KTV Trần Thu Hà',
    'Lê Ngọc Lan'
];

// ⏰ TỰ ĐỘNG CHUYỂN TRẠNG THÁI THEO THỜI GIAN
function autoUpdateBookingStatusByTime(bookings) {
    const now = new Date();
    let modified = false;

    bookings.forEach(b => {
        if (b.status === 'Cancelled' || b.status === 'Completed') return;

        // Parse ngày giờ hẹn (VD: "2026-09-03" + "09:30")
        if (b.date && b.time) {
            const [hours, minutes] = b.time.split(':').map(Number);
            const bookingDateTime = new Date(b.date);
            bookingDateTime.setHours(hours, minutes, 0, 0);

            // Thời gian kết thúc dự kiến (sau 60 phút)
            const endDateTime = new Date(bookingDateTime.getTime() + 60 * 60 * 1000);

            // 1. Đã duyệt (Confirmed) ➔ Nếu đến giờ hẹn ➔ Tự động thành Đang Phục Vụ (In_Progress)
            if (b.status === 'Confirmed' && now >= bookingDateTime && now < endDateTime) {
                b.status = 'In_Progress';
                console.log(`⏰ Tự động đổi đơn ${b.code} -> In_Progress`);
                modified = true;
            }
            // 2. Đang Phục Vụ (In_Progress) ➔ Nếu quá thời gian kết thúc ➔ Tự động thành Hoàn Thành (Completed)
            else if ((b.status === 'In_Progress' || b.status === 'Confirmed') && now >= endDateTime) {
                b.status = 'Completed';
                console.log(`⏰ Tự động đổi đơn ${b.code} -> Completed`);
                modified = true;
            }
        }
    });

    if (modified) {
        localStorage.setItem('aura_bookings', JSON.stringify(bookings));
    }
    return bookings;
}

// Tự động kiểm tra và khử trùng lặp mã đơn
function sanitizeDuplicateCodes(bookings) {
    const seenCodes = new Set();
    let modified = false;

    bookings.forEach(b => {
        if (seenCodes.has(b.code)) {
            let newCode;
            do {
                newCode = 'AURA-' + Math.floor(1000 + Math.random() * 9000);
            } while (seenCodes.has(newCode));

            b.code = newCode;
            modified = true;
        }
        seenCodes.add(b.code);
    });

    if (modified) {
        localStorage.setItem('aura_bookings', JSON.stringify(bookings));
    }
    return bookings;
}

// Khởi tạo dữ liệu từ localStorage
function getStoredBookings() {
    let stored = localStorage.getItem('aura_bookings');
    if (!stored) {
        localStorage.setItem('aura_bookings', JSON.stringify(INITIAL_DUMMY_BOOKINGS));
        stored = JSON.stringify(INITIAL_DUMMY_BOOKINGS);
    }
    let parsed = JSON.parse(stored);
    parsed = sanitizeDuplicateCodes(parsed);
    return autoUpdateBookingStatusByTime(parsed);
}

// Lưu dữ liệu vào LocalStorage
function saveBookings(bookings) {
    localStorage.setItem('aura_bookings', JSON.stringify(bookings));
}

// Bộ lọc
let currentFilterStatus = 'ALL';
let currentStaffFilter = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
});

function renderDashboard() {
    const bookings = getStoredBookings();
    renderStats(bookings);
    renderBookingsTable(bookings);
}

// Thống kê 4 thẻ đầu trang
function renderStats(bookings) {
    const totalCount = bookings.length;
    const pendingCount = bookings.filter(b => b.status === 'Pending').length;
    const inProgressCount = bookings.filter(b => b.status === 'In_Progress').length;

    const totalRevenue = bookings
        .filter(b => b.status !== 'Cancelled')
        .reduce((sum, b) => sum + (b.servicePrice || 0), 0);

    document.getElementById('statTotal').innerText = totalCount;
    document.getElementById('statPending').innerText = pendingCount;
    document.getElementById('statInProgress').innerText = inProgressCount;
    document.getElementById('statRevenue').innerText = totalRevenue.toLocaleString('vi-VN') + ' đ';
}

// Lọc danh sách lịch hẹn theo tab Status
function filterBookings(status, btnElement) {
    currentFilterStatus = status;

    document.querySelectorAll('.filter-tab-btn').forEach(btn => {
        btn.classList.remove('bg-rose-600', 'text-white', 'shadow-sm');
        btn.classList.add('bg-white', 'text-gray-600', 'hover:bg-gray-100');
    });

    btnElement.classList.remove('bg-white', 'text-gray-600', 'hover:bg-gray-100');
    btnElement.classList.add('bg-rose-600', 'text-white', 'shadow-sm');

    renderDashboard();
}

// Lọc danh sách lịch hẹn theo KTV
function filterByStaff(staffName) {
    currentStaffFilter = staffName;
    renderDashboard();
}

// Render Bảng Dữ Liệu Lịch Hẹn
function renderBookingsTable(bookings) {
    const tbody = document.getElementById('bookingsTbody');
    if (!tbody) return;

    let filtered = bookings;

    // Lọc theo Status
    if (currentFilterStatus !== 'ALL') {
        filtered = filtered.filter(b => b.status === currentFilterStatus);
    }

    // Lọc theo KTV
    if (currentStaffFilter !== 'ALL') {
        filtered = filtered.filter(b => b.staff.includes(currentStaffFilter));
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="p-8 text-center text-gray-400 text-sm">
                    📭 Không có lịch hẹn nào phù hợp với bộ lọc.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(b => `
        <tr class="hover:bg-rose-50/40 transition border-b border-gray-100">
            <!-- Mã đơn -->
            <td class="p-4 font-extrabold text-rose-600 text-xs">
                ${b.code}
            </td>

            <!-- Khách hàng -->
            <td class="p-4">
                <p class="font-bold text-gray-900 text-xs">${b.customerName}</p>
                <p class="text-[11px] text-gray-500">📞 ${b.customerPhone}</p>
                ${b.note ? `<p class="text-[10px] text-amber-600 italic">📝 ${b.note}</p>` : ''}
            </td>

            <!-- Dịch vụ & Giá -->
            <td class="p-4">
                <p class="font-bold text-gray-800 text-xs">${b.serviceName}</p>
                <p class="text-[11px] text-rose-600 font-extrabold">${(b.servicePrice || 0).toLocaleString('vi-VN')} đ</p>
            </td>

            <!-- Thời gian hẹn -->
            <td class="p-4 text-xs">
                <p class="font-bold text-gray-800">⏰ ${b.time}</p>
                <p class="text-[11px] text-gray-500">📅 ${b.date}</p>
            </td>

            <!-- Kỹ thuật viên (Cho phép đổi KTV linh hoạt) -->
            <td class="p-4 text-xs">
                ${(b.status === 'Pending' || b.status === 'Confirmed') ? `
                    <select onchange="reassignStaff('${b.code}', this.value)" class="bg-gray-50 border border-gray-200 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-rose-500">
                        <option value="Hệ thống tự xếp KTV" ${b.staff.includes('tự xếp') ? 'selected' : ''}>Tự xếp ngẫu nhiên</option>
                        <option value="KTV Nguyễn Minh Anh" ${b.staff.includes('Minh Anh') ? 'selected' : ''}>Minh Anh (Da)</option>
                        <option value="KTV Trần Thu Hà" ${b.staff.includes('Thu Hà') ? 'selected' : ''}>Thu Hà (Gội)</option>
                        <option value="KTV Lê Ngọc Lan" ${b.staff.includes('Ngọc Lan') ? 'selected' : ''}>Ngọc Lan (Massage)</option>
                    </select>
                ` : `<span class="font-semibold text-gray-700">${b.staff}</span>`}
            </td>

            <!-- Trạng thái Badge -->
            <td class="p-4">
                ${getStatusBadge(b.status)}
            </td>

            <!-- Thao tác Duyệt & Hủy đơn -->
            <td class="p-4 text-right space-x-1">
                ${renderAdminActionButtons(b.code, b.status)}
            </td>
        </tr>
    `).join('');
}

// Trả về HTML Badge Trạng Thái
function getStatusBadge(status) {
    switch (status) {
        case 'Pending':
            return `<span class="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200">⏳ Chờ Duyệt</span>`;
        case 'Confirmed':
            return `<span class="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-blue-200">✓ Đã Duyệt (Tự động vào ca)</span>`;
        case 'In_Progress':
            return `<span class="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-purple-200 animate-pulse">💆‍♀️ Đang Phục Vụ</span>`;
        case 'Completed':
            return `<span class="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">🎉 Hoàn Thành</span>`;
        case 'Cancelled':
            return `<span class="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-red-200">✕ Đã Hủy</span>`;
        default:
            return `<span class="bg-gray-100 text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded-full">${status}</span>`;
    }
}

// Nút bấm Thao tác: Admin CHỈ CẦN DUYỆT ĐƠN 1 LẦN duy nhất!
function renderAdminActionButtons(code, status) {
    if (status === 'Pending') {
        return `
            <button onclick="updateBookingStatus('${code}', 'Confirmed')" class="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition shadow-sm">✓ Duyệt Đơn</button>
            <button onclick="cancelBookingByStaff('${code}')" class="bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold px-2 py-1 rounded-lg transition">Hủy</button>
        `;
    } else if (status === 'Confirmed') {
        return `
            <button onclick="cancelBookingByStaff('${code}')" class="bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold px-2 py-1 rounded-lg transition">✕ Hủy Ca (KTV Bận)</button>
        `;
    } else {
        return `<span class="text-[11px] text-gray-400">Đã khóa</span>`;
    }
}

// Hàm đổi KTV cho đơn hàng
function reassignStaff(code, newStaffName) {
    let bookings = getStoredBookings();
    const index = bookings.findIndex(b => b.code === code);

    if (index !== -1) {
        bookings[index].staff = newStaffName;
        bookings[index].note = (bookings[index].note || '') + ` (Đã chuyển cho ${newStaffName})`;
        saveBookings(bookings);
        renderDashboard();
    }
}

// KTV / Admin Hủy Ca do Bận
function cancelBookingByStaff(code) {
    const reason = prompt(`Nhập lý do hủy ca cho đơn ${code} (VD: KTV bận đột xuất / Không sắp xếp được KTV):`, 'KTV bận đột xuất');
    if (reason === null) return;

    let bookings = getStoredBookings();
    const index = bookings.findIndex(b => b.code === code);

    if (index !== -1) {
        bookings[index].status = 'Cancelled';
        bookings[index].note = (bookings[index].note || '') + ` [Đã hủy: ${reason}]`;
        saveBookings(bookings);
        renderDashboard();
    }
}

// Cập nhật trạng thái đơn thủ công
function updateBookingStatus(code, newStatus) {
    let bookings = getStoredBookings();
    const index = bookings.findIndex(b => b.code === code);

    if (index !== -1) {
        bookings[index].status = newStatus;
        saveBookings(bookings);
        renderDashboard();
    }
}
