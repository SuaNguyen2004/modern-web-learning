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

// Khởi tạo dữ liệu
function getStoredBookings() {
    let stored = localStorage.getItem('aura_bookings');
    if (!stored) {
        localStorage.setItem('aura_bookings', JSON.stringify(INITIAL_DUMMY_BOOKINGS));
        return INITIAL_DUMMY_BOOKINGS;
    }
    return JSON.parse(stored);
}

// Lưu dữ liệu vào LocalStorage
function saveBookings(bookings) {
    localStorage.setItem('aura_bookings', JSON.stringify(bookings));
}

// Biến toàn cục theo dõi bộ lọc hiện tại
let currentFilterStatus = 'ALL';

// Render lại giao diện Dashboard khi load trang
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
});

function renderDashboard() {
    const bookings = getStoredBookings();
    renderStats(bookings);
    renderBookingsTable(bookings, currentFilterStatus);
}

// Thống kê 4 thẻ đầu trang
function renderStats(bookings) {
    const totalCount = bookings.length;
    const pendingCount = bookings.filter(b => b.status === 'Pending').length;
    const inProgressCount = bookings.filter(b => b.status === 'In_Progress').length;
    const completedCount = bookings.filter(b => b.status === 'Completed').length;

    // Tính tổng doanh thu dự kiến
    const totalRevenue = bookings
        .filter(b => b.status !== 'Cancelled')
        .reduce((sum, b) => sum + (b.servicePrice || 0), 0);

    document.getElementById('statTotal').innerText = totalCount;
    document.getElementById('statPending').innerText = pendingCount;
    document.getElementById('statInProgress').innerText = inProgressCount;
    document.getElementById('statRevenue').innerText = totalRevenue.toLocaleString('vi-VN') + ' đ';
}

// Lọc danh sách lịch hẹn theo tab
function filterBookings(status, btnElement) {
    currentFilterStatus = status;

    // Đổi active tab button
    document.querySelectorAll('.filter-tab-btn').forEach(btn => {
        btn.classList.remove('bg-rose-600', 'text-white', 'shadow-sm');
        btn.classList.add('bg-white', 'text-gray-600', 'hover:bg-gray-100');
    });

    btnElement.classList.remove('bg-white', 'text-gray-600', 'hover:bg-gray-100');
    btnElement.classList.add('bg-rose-600', 'text-white', 'shadow-sm');

    const bookings = getStoredBookings();
    renderBookingsTable(bookings, currentFilterStatus);
}

// Render Bảng Dữ Liệu Lịch Hẹn
function renderBookingsTable(bookings, filterStatus) {
    const tbody = document.getElementById('bookingsTbody');
    if (!tbody) return;

    let filtered = bookings;
    if (filterStatus !== 'ALL') {
        filtered = bookings.filter(b => b.status === filterStatus);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="p-8 text-center text-gray-400 text-sm">
                    📭 Không có lịch hẹn nào trong mục này.
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

            <!-- Kỹ thuật viên -->
            <td class="p-4 text-xs font-semibold text-gray-700">
                ${b.staff}
            </td>

            <!-- Trạng thái Badge -->
            <td class="p-4">
                ${getStatusBadge(b.status)}
            </td>

            <!-- Hành động đổi trạng thái -->
            <td class="p-4 text-right space-x-1">
                ${renderActionButtons(b.code, b.status)}
            </td>
        </tr>
    `).join('');
}

// Trả về HTML Badge Trạng Thái
function getStatusBadge(status) {
    switch (status) {
        case 'Pending':
            return `<span class="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200">⏳ Chờ Xác Nhận</span>`;
        case 'Confirmed':
            return `<span class="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-blue-200">✓ Đã Xác Nhận</span>`;
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

// Trả về Nút bấm Thao tác tùy thuộc vào trạng thái
function renderActionButtons(code, status) {
    if (status === 'Pending') {
        return `
            <button onclick="updateBookingStatus('${code}', 'Confirmed')" class="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition">Duyệt Đơn</button>
            <button onclick="updateBookingStatus('${code}', 'Cancelled')" class="bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold px-2 py-1 rounded-lg transition">Hủy</button>
        `;
    } else if (status === 'Confirmed') {
        return `
            <button onclick="updateBookingStatus('${code}', 'In_Progress')" class="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition">Bắt Đầu Phục Vụ</button>
        `;
    } else if (status === 'In_Progress') {
        return `
            <button onclick="updateBookingStatus('${code}', 'Completed')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition">Xong Ca</button>
        `;
    } else {
        return `<span class="text-[11px] text-gray-400">Đã khóa</span>`;
    }
}

// Hàm cập nhật trạng thái đơn
function updateBookingStatus(code, newStatus) {
    let bookings = getStoredBookings();
    const index = bookings.findIndex(b => b.code === code);

    if (index !== -1) {
        bookings[index].status = newStatus;
        saveBookings(bookings);
        renderDashboard();
    }
}
