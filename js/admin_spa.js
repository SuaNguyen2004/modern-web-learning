// ==========================================
// SPA ADMIN & STAFF DASHBOARD SCRIPT (FETCH API CONNECTED)
// ==========================================

const API_BASE_URL = 'api/';

let currentFilterStatus = 'ALL';
let currentStaffFilter = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    renderAdminChat();
});

async function renderDashboard() {
    try {
        let url = API_BASE_URL + 'bookings.php?';
        if (currentFilterStatus !== 'ALL') url += 'status=' + encodeURIComponent(currentFilterStatus) + '&';
        if (currentStaffFilter !== 'ALL') url += 'staff=' + encodeURIComponent(currentStaffFilter) + '&';

        const response = await fetch(url);
        const res = await response.json();

        if (res.status === 'success' && res.data) {
            renderStats(res.data);
            renderBookingsTable(res.data);
        }
    } catch (e) {
        console.error('Lỗi tải dữ liệu Dashboard từ MySQL:', e);
    }
}

function renderStats(bookings) {
    const totalCount = bookings.length;
    const pendingCount = bookings.filter(b => b.status === 'Pending').length;
    const inProgressCount = bookings.filter(b => b.status === 'In_Progress').length;

    const totalRevenue = bookings
        .filter(b => b.status !== 'Cancelled')
        .reduce((sum, b) => sum + (parseInt(b.servicePrice) || 0), 0);

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

    if (bookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="p-8 text-center text-gray-400 text-sm">
                    📭 Không có lịch hẹn nào phù hợp với bộ lọc.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = bookings.map(b => `
        <tr class="hover:bg-rose-50/40 transition border-b border-gray-100">
            <td class="p-3.5 font-extrabold text-rose-600 text-xs whitespace-nowrap">
                ${b.code}
            </td>
            <td class="p-3.5 whitespace-nowrap">
                <p class="font-bold text-gray-900 text-xs">${b.customerName}</p>
                <p class="text-[11px] text-gray-500">📞 ${b.customerPhone}</p>
                ${b.note ? `<p class="text-[10px] text-amber-600 italic max-w-[150px] truncate">📝 ${b.note}</p>` : ''}
            </td>
            <td class="p-3.5">
                <p class="font-bold text-gray-800 text-xs">${b.serviceName}</p>
                <p class="text-[11px] text-rose-600 font-extrabold">${(parseInt(b.servicePrice) || 0).toLocaleString('vi-VN')} đ</p>
            </td>
            <td class="p-3.5 text-xs whitespace-nowrap">
                <p class="font-bold text-gray-800">⏰ ${b.time}</p>
                <p class="text-[11px] text-gray-500">📅 ${b.date}</p>
            </td>
            <td class="p-3.5 text-xs whitespace-nowrap">
                ${(b.status === 'Pending' || b.status === 'Confirmed') ? `
                    <select onchange="reassignStaff('${b.code}', this.value)" class="bg-gray-50 border border-gray-200 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rose-500">
                        <option value="Hệ thống tự xếp KTV" ${b.staff.includes('tự xếp') ? 'selected' : ''}>Tự xếp ngẫu nhiên</option>
                        <option value="KTV Nguyễn Minh Anh" ${b.staff.includes('Minh Anh') ? 'selected' : ''}>Minh Anh (Da)</option>
                        <option value="KTV Trần Thu Hà" ${b.staff.includes('Thu Hà') ? 'selected' : ''}>Thu Hà (Gội)</option>
                        <option value="KTV Lê Ngọc Lan" ${b.staff.includes('Ngọc Lan') ? 'selected' : ''}>Ngọc Lan (Massage)</option>
                    </select>
                ` : `<span class="font-semibold text-gray-700">${b.staff}</span>`}
            </td>
            <td class="p-3.5 whitespace-nowrap">
                ${getStatusBadge(b.status)}
            </td>
            <td class="p-3.5 text-right whitespace-nowrap space-x-1">
                ${renderAdminActionButtons(b.code, b.status)}
            </td>
        </tr>
    `).join('');
}

function getStatusBadge(status) {
    switch (status) {
        case 'Pending':
            return `<span class="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200 inline-block whitespace-nowrap">⏳ Chờ Duyệt</span>`;
        case 'Confirmed':
            return `<span class="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-blue-200 inline-block whitespace-nowrap">✓ Đã Duyệt</span>`;
        case 'In_Progress':
            return `<span class="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-purple-200 animate-pulse inline-block whitespace-nowrap">💆‍♀️ Đang Phục Vụ</span>`;
        case 'Completed':
            return `<span class="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 inline-block whitespace-nowrap">🎉 Hoàn Thành</span>`;
        case 'Cancelled':
            return `<span class="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-red-200 inline-block whitespace-nowrap">✕ Đã Hủy</span>`;
        default:
            return `<span class="bg-gray-100 text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded-full inline-block whitespace-nowrap">${status}</span>`;
    }
}

function renderAdminActionButtons(code, status) {
    if (status === 'Pending') {
        return `
            <button onclick="updateBookingStatus('${code}', 'Confirmed')" class="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition shadow-sm whitespace-nowrap">✓ Duyệt Đơn</button>
            <button onclick="openCancelReasonModal('${code}')" class="bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">Hủy</button>
        `;
    } else if (status === 'Confirmed') {
        return `
            <button onclick="openCancelReasonModal('${code}')" class="bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition whitespace-nowrap">✕ Hủy Ca (Bận)</button>
        `;
    } else {
        return `<span class="text-[11px] text-gray-400">Đã khóa</span>`;
    }
}

async function reassignStaff(code, newStaffName) {
    try {
        await fetch(API_BASE_URL + 'bookings.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: code,
                staff: newStaffName,
                note: `(Đã chuyển cho ${newStaffName})`
            })
        });
        renderDashboard();
    } catch (e) {
        console.error('Lỗi đổi KTV:', e);
    }
}

// ==========================================
// 🌟 MODAL HỦY CA BẰNG TAILWIND (CẬP NHẬT TỚI MYSQL)
// ==========================================

let targetCancelCode = '';

function openCancelReasonModal(code) {
    targetCancelCode = code;
    const modal = document.getElementById('cancelReasonModal');
    if (!modal) return;

    document.getElementById('cancelCodeDisplay').innerText = code;
    document.getElementById('cancelReasonInput').value = 'KTV bận đột xuất';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeCancelReasonModal() {
    const modal = document.getElementById('cancelReasonModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function setQuickReason(text) {
    const input = document.getElementById('cancelReasonInput');
    if (input) input.value = text;
}

async function confirmCancelBookingByStaff() {
    const reasonInput = document.getElementById('cancelReasonInput');
    const reason = reasonInput ? reasonInput.value.trim() : 'KTV bận';

    if (!targetCancelCode) return;

    try {
        await fetch(API_BASE_URL + 'bookings.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: targetCancelCode,
                status: 'Cancelled',
                note: `[Đã hủy ca: ${reason}]`
            })
        });

        closeCancelReasonModal();
        renderDashboard();
    } catch (e) {
        alert('Lỗi hủy ca!');
    }
}

async function updateBookingStatus(code, newStatus) {
    try {
        await fetch(API_BASE_URL + 'bookings.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: code,
                status: newStatus
            })
        });
        renderDashboard();
    } catch (e) {
        console.error('Lỗi cập nhật trạng thái:', e);
    }
}

// ==========================================
// 💬 CHỨC NĂNG LIVE CHAT VỚI KHÁCH HÀNG (FETCH FROM MYSQL)
// ==========================================

function toggleAdminChatModal() {
    const modal = document.getElementById('adminChatModal');
    if (!modal) return;
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        renderAdminChat();
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

async function renderAdminChat() {
    const adminChatBody = document.getElementById('adminChatMessagesBody');
    if (!adminChatBody) return;

    try {
        const response = await fetch(API_BASE_URL + 'chat.php');
        const res = await response.json();
        const messages = (res.status === 'success' && res.data) ? res.data : [];

        adminChatBody.innerHTML = messages.map(msg => {
            const isAdmin = msg.sender === 'spa';
            return `
                <div class="flex flex-col ${isAdmin ? 'items-end' : 'items-start'} mb-3">
                    <span class="text-[10px] text-slate-400 font-semibold mb-1 px-1">
                        ${isAdmin ? '🌸 Lễ Tân AuraSpa (Bạn)' : '👤 Khách Hàng'} • ${msg.time}
                    </span>
                    <div class="${isAdmin ? 'bg-rose-600 text-white rounded-2xl rounded-tr-none shadow-sm' : 'bg-slate-800 text-white border border-slate-700 rounded-2xl rounded-tl-none shadow-sm'} p-3 max-w-[85%] text-xs leading-relaxed">
                        ${msg.message_text || msg.text}
                    </div>
                </div>
            `;
        }).join('');

        adminChatBody.scrollTop = adminChatBody.scrollHeight;
    } catch (e) {
        console.error('Lỗi tải Chat Admin:', e);
    }
}

async function handleAdminSendChat(event) {
    event.preventDefault();
    const input = document.getElementById('adminChatInput');
    const text = input.value.trim();
    if (!text) return;

    try {
        await fetch(API_BASE_URL + 'chat.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender: 'spa',
                senderName: 'Lễ Tân AuraSpa',
                text: text
            })
        });

        input.value = '';
        renderAdminChat();
    } catch (e) {
        console.error('Lỗi gửi tin nhắn Admin:', e);
    }
}
