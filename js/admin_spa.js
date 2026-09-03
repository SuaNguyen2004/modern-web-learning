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

// Tự động chuyển trạng thái theo thời gian
function autoUpdateBookingStatusByTime(bookings) {
    const now = new Date();
    let modified = false;

    bookings.forEach(b => {
        if (b.status === 'Cancelled' || b.status === 'Completed') return;

        if (b.date && b.time) {
            const [hours, minutes] = b.time.split(':').map(Number);
            const bookingDateTime = new Date(b.date);
            bookingDateTime.setHours(hours, minutes, 0, 0);
            const endDateTime = new Date(bookingDateTime.getTime() + 60 * 60 * 1000);

            if (b.status === 'Confirmed' && now >= bookingDateTime && now < endDateTime) {
                b.status = 'In_Progress';
                modified = true;
            } else if ((b.status === 'In_Progress' || b.status === 'Confirmed') && now >= endDateTime) {
                b.status = 'Completed';
                modified = true;
            }
        }
    });

    if (modified) {
        localStorage.setItem('aura_bookings', JSON.stringify(bookings));
    }
    return bookings;
}

// Khử trùng lặp mã đơn
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

function saveBookings(bookings) {
    localStorage.setItem('aura_bookings', JSON.stringify(bookings));
}

let currentFilterStatus = 'ALL';
let currentStaffFilter = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    renderAdminChat();
});

function renderDashboard() {
    const bookings = getStoredBookings();
    renderStats(bookings);
    renderBookingsTable(bookings);
}

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

function filterByStaff(staffName) {
    currentStaffFilter = staffName;
    renderDashboard();
}

function renderBookingsTable(bookings) {
    const tbody = document.getElementById('bookingsTbody');
    if (!tbody) return;

    let filtered = bookings;

    if (currentFilterStatus !== 'ALL') {
        filtered = filtered.filter(b => b.status === currentFilterStatus);
    }

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
            <td class="p-4 font-extrabold text-rose-600 text-xs">
                ${b.code}
            </td>
            <td class="p-4">
                <p class="font-bold text-gray-900 text-xs">${b.customerName}</p>
                <p class="text-[11px] text-gray-500">📞 ${b.customerPhone}</p>
                ${b.note ? `<p class="text-[10px] text-amber-600 italic">📝 ${b.note}</p>` : ''}
            </td>
            <td class="p-4">
                <p class="font-bold text-gray-800 text-xs">${b.serviceName}</p>
                <p class="text-[11px] text-rose-600 font-extrabold">${(b.servicePrice || 0).toLocaleString('vi-VN')} đ</p>
            </td>
            <td class="p-4 text-xs">
                <p class="font-bold text-gray-800">⏰ ${b.time}</p>
                <p class="text-[11px] text-gray-500">📅 ${b.date}</p>
            </td>
            <td class="p-4 text-xs">
                ${(b.status === 'Pending' || b.status === 'Confirmed') ? `
                    <select onchange="reassignStaff('${b.code}', this.value)" class="bg-gray-50 border border-gray-200 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rose-500">
                        <option value="Hệ thống tự xếp KTV" ${b.staff.includes('tự xếp') ? 'selected' : ''}>Tự xếp ngẫu nhiên</option>
                        <option value="KTV Nguyễn Minh Anh" ${b.staff.includes('Minh Anh') ? 'selected' : ''}>Minh Anh (Da)</option>
                        <option value="KTV Trần Thu Hà" ${b.staff.includes('Thu Hà') ? 'selected' : ''}>Thu Hà (Gội)</option>
                        <option value="KTV Lê Ngọc Lan" ${b.staff.includes('Ngọc Lan') ? 'selected' : ''}>Ngọc Lan (Massage)</option>
                    </select>
                ` : `<span class="font-semibold text-gray-700">${b.staff}</span>`}
            </td>
            <td class="p-4">
                ${getStatusBadge(b.status)}
            </td>
            <td class="p-4 text-right space-x-1">
                ${renderAdminActionButtons(b.code, b.status)}
            </td>
        </tr>
    `).join('');
}

function getStatusBadge(status) {
    switch (status) {
        case 'Pending':
            return `<span class="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200">⏳ Chờ Duyệt</span>`;
        case 'Confirmed':
            return `<span class="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-blue-200">✓ Đã Duyệt</span>`;
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

function cancelBookingByStaff(code) {
    const reason = prompt(`Nhập lý do hủy ca cho đơn ${code}:`, 'KTV bận đột xuất');
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

function updateBookingStatus(code, newStatus) {
    let bookings = getStoredBookings();
    const index = bookings.findIndex(b => b.code === code);

    if (index !== -1) {
        bookings[index].status = newStatus;
        saveBookings(bookings);
        renderDashboard();
    }
}

// ==========================================
// 💬 CHỨC NĂNG LIVE CHAT VỚI KHÁCH HÀNG (ADMIN SIDE)
// ==========================================

function renderAdminChat() {
    const adminChatBody = document.getElementById('adminChatMessagesBody');
    if (!adminChatBody) return;

    let stored = localStorage.getItem('aura_chat_messages');
    let messages = stored ? JSON.parse(stored) : [];

    adminChatBody.innerHTML = messages.map(msg => {
        const isAdmin = msg.sender === 'spa';
        return `
            <div class="flex flex-col ${isAdmin ? 'items-end' : 'items-start'} mb-3">
                <span class="text-[10px] text-slate-400 mb-1 px-1">${msg.senderName || (isAdmin ? 'Chủ Spa' : 'Khách Hàng')} • ${msg.time}</span>
                <div class="${isAdmin ? 'bg-rose-600 text-white rounded-2xl rounded-tr-none' : 'bg-slate-800 text-white border border-slate-700 rounded-2xl rounded-tl-none'} p-3 max-w-[85%] text-xs leading-relaxed">
                    ${msg.text}
                </div>
            </div>
        `;
    }).join('');

    adminChatBody.scrollTop = adminChatBody.scrollHeight;
}

function handleAdminSendChat(event) {
    event.preventDefault();
    const input = document.getElementById('adminChatInput');
    const text = input.value.trim();
    if (!text) return;

    let stored = localStorage.getItem('aura_chat_messages');
    let messages = stored ? JSON.parse(stored) : [];

    messages.push({
        sender: 'spa',
        senderName: 'Lễ Tân AuraSpa',
        text: text,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    });

    input.value = '';
    localStorage.setItem('aura_chat_messages', JSON.stringify(messages));
    renderAdminChat();
}

// Tự động đồng bộ tin nhắn từ phía Khách Hàng gửi tới
window.addEventListener('storage', (e) => {
    if (e.key === 'aura_chat_messages') {
        renderAdminChat();
    }
});
