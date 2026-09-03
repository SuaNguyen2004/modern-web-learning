// ==========================================
// AURA SPA CUSTOMER PORTAL SCRIPT (KHÁCH HÀNG THÂN THIẾT)
// ==========================================

const CURRENT_CUSTOMER = {
    name: 'Nguyễn Thanh Hằng',
    phone: '0908123456',
    email: 'thanhhang.aura@gmail.com',
    rank: 'Thành Viên Vàng (Gold Member)',
    rankBadge: '👑 VIP GOLD',
    points: 1250,
    avatar: 'TH'
};

const INITIAL_VOUCHERS = [
    {
        code: 'AURA100K',
        title: 'Giảm 100.000đ Cho Combo VIP 90p',
        description: 'Áp dụng cho dịch vụ Combo Chăm Sóc Da & Gội Đầu VIP',
        discountText: '100.000 đ',
        expiry: '30/09/2026',
        minSpend: '350.000 đ',
        bgGradient: 'from-amber-500 to-rose-500'
    },
    {
        code: 'SPA20OFF',
        title: 'Ưu Đãi 20% Dịch Vụ Gội Đầu Dưỡng Sinh',
        description: 'Dành riêng cho khách hàng thân thiết hạng Vàng',
        discountText: 'GIẢM 20%',
        expiry: '15/10/2026',
        minSpend: '199.000 đ',
        bgGradient: 'from-rose-500 to-pink-600'
    },
    {
        code: 'SINHNHATVIP',
        title: 'Quà Tặng Tri Ân Tháng Sinh Nhật',
        description: 'Miễn phí điện di Vitamin C khi đặt dịch vụ Chăm sóc da',
        discountText: 'QUÀ TẶNG VIP',
        expiry: '31/12/2026',
        minSpend: '0 đ',
        bgGradient: 'from-purple-600 to-indigo-600'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // Đảm bảo lưu phiên khách hàng VIP vào localStorage
    localStorage.setItem('aura_logged_customer', JSON.stringify({
        name: CURRENT_CUSTOMER.name,
        phone: CURRENT_CUSTOMER.phone,
        rank: CURRENT_CUSTOMER.rankBadge
    }));

    renderCustomerProfile();
    renderMyBookings();
    renderVouchers();
});

function renderCustomerProfile() {
    const custName = document.getElementById('custName');
    const custPhone = document.getElementById('custPhone');
    const custRank = document.getElementById('custRank');
    const custPoints = document.getElementById('custPoints');

    if (custName) custName.innerText = CURRENT_CUSTOMER.name;
    if (custPhone) custPhone.innerText = CURRENT_CUSTOMER.phone;
    if (custRank) custRank.innerText = CURRENT_CUSTOMER.rankBadge;
    if (custPoints) custPoints.innerText = CURRENT_CUSTOMER.points.toLocaleString('vi-VN');
}

function renderMyBookings() {
    const listContainer = document.getElementById('myBookingsList');
    if (!listContainer) return;

    let stored = localStorage.getItem('aura_bookings');
    let allBookings = stored ? JSON.parse(stored) : [];

    let myBookings = allBookings.filter(b => b.customerPhone === CURRENT_CUSTOMER.phone || b.customerName === CURRENT_CUSTOMER.name);
    
    if (myBookings.length === 0) {
        myBookings = allBookings.slice(0, 3);
    }

    if (myBookings.length === 0) {
        listContainer.innerHTML = `
            <div class="p-8 text-center text-gray-400 space-y-2">
                <span class="text-3xl">📭</span>
                <p class="text-xs">Bạn chưa có lịch hẹn nào. Hãy đặt lịch ngay để tích điểm VIP nhé!</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = myBookings.map(b => `
        <div class="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1.5">
                <div class="flex items-center gap-2">
                    <span class="font-extrabold text-rose-600 text-sm">${b.code}</span>
                    ${getStatusBadgeHTML(b.status)}
                </div>
                <h4 class="font-bold text-gray-900 text-sm">${b.serviceName}</h4>
                <p class="text-xs text-gray-500">📅 Ngày hẹn: <strong class="text-gray-700">${b.date}</strong> | ⏰ Giờ: <strong class="text-gray-700">${b.time}</strong></p>
                <p class="text-xs text-gray-500">👩‍🎨 KTV Phục vụ: <strong class="text-rose-600">${b.staff}</strong></p>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                <span class="text-base font-extrabold text-rose-600">${(b.servicePrice || 0).toLocaleString('vi-VN')} đ</span>
                ${(b.status === 'Pending' || b.status === 'Confirmed') ? `
                    <button onclick="cancelBookingCustomer('${b.code}')" class="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 rounded-xl transition">
                        ✕ Hủy Lịch
                    </button>
                ` : `
                    <button onclick="openBookingModal('${b.serviceName}', ${b.servicePrice})" class="bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold px-3.5 py-2 rounded-xl transition">
                        🔄 Đặt Lại
                    </button>
                `}
            </div>
        </div>
    `).join('');
}

function cancelBookingCustomer(code) {
    if (!confirm(`Bạn có chắc chắn muốn hủy lịch hẹn ${code} không?`)) return;

    let stored = localStorage.getItem('aura_bookings');
    let allBookings = stored ? JSON.parse(stored) : [];
    const index = allBookings.findIndex(b => b.code === code);

    if (index !== -1) {
        allBookings[index].status = 'Cancelled';
        allBookings[index].note = (allBookings[index].note || '') + ' (Khách tự hủy từ trang cá nhân)';
        localStorage.setItem('aura_bookings', JSON.stringify(allBookings));
        renderMyBookings();
        alert(`Đã hủy lịch hẹn ${code} thành công.`);
    }
}

function renderVouchers() {
    const voucherList = document.getElementById('vouchersContainer');
    if (!voucherList) return;

    voucherList.innerHTML = INITIAL_VOUCHERS.map(v => `
        <div class="bg-gradient-to-r ${v.bgGradient} text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between space-y-4">
            <span class="absolute -right-4 -bottom-4 text-white/10 text-8xl font-black">VIP</span>
            <div class="space-y-1">
                <span class="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">MÃ: ${v.code}</span>
                <h4 class="font-extrabold text-lg mt-2">${v.title}</h4>
                <p class="text-white/90 text-xs leading-relaxed">${v.description}</p>
            </div>
            <div class="pt-3 border-t border-white/20 flex items-center justify-between">
                <div>
                    <span class="text-[10px] text-white/80 block">Hạn sử dụng: ${v.expiry}</span>
                    <span class="text-sm font-black text-amber-200">${v.discountText}</span>
                </div>
                <button onclick="useVoucherDirectly('${v.code}')" class="bg-white hover:bg-rose-50 text-gray-900 font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-md transition active:scale-95">
                    Dùng Ngay ✨
                </button>
            </div>
        </div>
    `).join('');
}

// Bấm "Dùng Ngay" voucher ➔ Mở Modal Đặt Lịch kèm áp mã ưu đãi
function useVoucherDirectly(code) {
    if (typeof openBookingModal === 'function') {
        openBookingModal(null, null, code);
    } else {
        alert(`Mã ưu đãi ${code} đã sẵn sàng! Bạn hãy qua trang Đặt Lịch để sử dụng nhé.`);
    }
}

function redeemPoints(cost, voucherName) {
    if (CURRENT_CUSTOMER.points < cost) {
        alert(`Bạn cần thêm ${(cost - CURRENT_CUSTOMER.points)} điểm thưởng nữa để đổi voucher này!`);
        return;
    }

    CURRENT_CUSTOMER.points -= cost;
    renderCustomerProfile();
    alert(`🎉 Chúc mừng bạn đã đổi thành công ${voucherName}! Mã ưu đãi đã được áp dụng cho tài khoản VIP của bạn.`);
}

function getStatusBadgeHTML(status) {
    switch (status) {
        case 'Pending':
            return `<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">⏳ Chờ duyệt</span>`;
        case 'Confirmed':
            return `<span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">✓ Đã duyệt</span>`;
        case 'In_Progress':
            return `<span class="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">💆‍♀️ Đang phục vụ</span>`;
        case 'Completed':
            return `<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">🎉 Hoàn thành</span>`;
        case 'Cancelled':
            return `<span class="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">✕ Đã hủy</span>`;
        default:
            return `<span class="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">${status}</span>`;
    }
}
