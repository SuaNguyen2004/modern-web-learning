// ==========================================
// SPA BOOKING & FEEDBACK INTERACTIVE SCRIPT (FETCH API CONNECTED & ROLE SAFE)
// ==========================================

const API_BASE_URL = 'api/';

// Bảng danh sách dịch vụ Spa & Giá tiền (Dự phòng)
let SERVICES_LIST = [
    { name: 'Gội Đầu Dưỡng Sinh Thảo Dược', price: 199000, duration: '60 Phút' },
    { name: 'Chăm Sóc Da Mặt Chuyên Sâu', price: 350000, duration: '75 Phút' },
    { name: 'Massage Cổ Vai Gáy Trị Liệu', price: 250000, duration: '45 Phút' },
    { name: 'Combo Chăm Sóc Da & Gội Đầu VIP', price: 499000, duration: '90 Phút' }
];

document.addEventListener('DOMContentLoaded', () => {
    fetchServicesFromAPI();
});

// Tải danh sách Dịch vụ từ API PHP MySQL
async function fetchServicesFromAPI() {
    try {
        const response = await fetch(API_BASE_URL + 'services.php');
        const result = await response.json();
        if (result.status === 'success' && result.data && result.data.length > 0) {
            SERVICES_LIST = result.data.map(s => ({
                name: s.name,
                price: parseInt(s.price),
                duration: s.duration
            }));
            populateServiceDropdown();
        }
    } catch (e) {
        populateServiceDropdown();
    }
}

function populateServiceDropdown() {
    const serviceSelect = document.getElementById('serviceSelect');
    if (!serviceSelect) return;

    serviceSelect.innerHTML = SERVICES_LIST.map(s => `
        <option value="${s.name}">${s.name} (${s.duration})</option>
    `).join('');
}

// Toggle Mở/Đóng Menu Mobile (Hamburger Menu)
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenuDrawer');
    if (!mobileMenu) return;
    mobileMenu.classList.toggle('hidden');
}

// Mở Modal Đặt Lịch (CHẶN ADMIN/KTV VÀ NHẬN DIỆN CHÍNH XÁC USER ĐĂNG NHẬP)
function openBookingModal(serviceName = null, price = null, voucherCode = null) {
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

    // 1. Nếu là Admin hoặc KTV ➔ KHÔNG CHO ĐẶT LỊCH!
    if (user && (user.role === 'admin' || user.role === 'ktv')) {
        alert('⚠️ Bạn đang đăng nhập với tài khoản ' + (user.role === 'admin' ? 'Chủ Spa / Admin' : 'Kỹ Thuật Viên') + '. Quyền Quản lý không cần Đặt lịch dịch vụ!');
        return;
    }

    const modal = document.getElementById('bookingModal');
    if (!modal) return;

    const mobileMenu = document.getElementById('mobileMenuDrawer');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
    }

    const serviceSelect = document.getElementById('serviceSelect');
    if (serviceSelect) {
        if (serviceName) {
            serviceSelect.value = serviceName;
        } else if (SERVICES_LIST.length > 0) {
            serviceSelect.value = SERVICES_LIST[0].name;
        }
        updateSelectedServicePrice();
    }

    const voucherInput = document.getElementById('inputVoucherCode');
    if (voucherInput) {
        voucherInput.value = voucherCode || '';
    }

    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        dateInput.value = today;
        dateInput.min = today;
    }

    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const vipBadge = document.getElementById('vipStatusNotice');

    // 2. Nhận diện chính xác nếu là Khách hàng đăng nhập
    if (user && user.role === 'customer') {
        if (nameInput) {
            nameInput.value = user.name;
            nameInput.readOnly = true;
            nameInput.classList.add('bg-slate-100', 'text-slate-700', 'font-bold', 'cursor-not-allowed');
        }
        if (phoneInput) {
            phoneInput.value = user.phone;
            phoneInput.readOnly = true;
            phoneInput.classList.add('bg-slate-100', 'text-slate-700', 'font-bold', 'cursor-not-allowed');
        }
        if (vipBadge) {
            vipBadge.innerText = `✨ Tự động nhận diện: Khách hàng ${user.rank_badge || 'VIP'} (${user.name})`;
            vipBadge.classList.remove('hidden');
        }
    } else {
        // Khách vãng lai (Chưa đăng nhập) ➔ Cho tự do nhập tên & SĐT
        if (nameInput) {
            nameInput.value = '';
            nameInput.readOnly = false;
            nameInput.classList.remove('bg-slate-100', 'text-slate-700', 'font-bold', 'cursor-not-allowed');
        }
        if (phoneInput) {
            phoneInput.value = '';
            phoneInput.readOnly = false;
            phoneInput.classList.remove('bg-slate-100', 'text-slate-700', 'font-bold', 'cursor-not-allowed');
        }
        if (vipBadge) vipBadge.classList.add('hidden');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// Cập nhật giá tiền khi thay đổi Dịch vụ trong dropdown
function updateSelectedServicePrice() {
    const serviceSelect = document.getElementById('serviceSelect');
    if (!serviceSelect) return;

    const selectedName = serviceSelect.value;
    const found = SERVICES_LIST.find(s => s.name === selectedName);

    if (found) {
        document.getElementById('inputService').value = found.name;
        document.getElementById('inputPrice').value = found.price;
        document.getElementById('selectedServicePrice').innerText = found.price.toLocaleString('vi-VN') + ' đ';
    }
}

// Đóng Modal Đặt Lịch
function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// Chọn khung giờ
let selectedTimeSlot = '09:30';
function selectTimeSlot(element, time) {
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
        btn.classList.remove('bg-rose-600', 'text-white', 'border-rose-600');
        btn.classList.add('bg-gray-50', 'text-gray-700', 'border-gray-200');
    });

    element.classList.remove('bg-gray-50', 'text-gray-700', 'border-gray-200');
    element.classList.add('bg-rose-600', 'text-white', 'border-rose-600');
    selectedTimeSlot = time;
}

// Xử lý gửi Form Đặt Lịch (Tới PHP API & MySQL)
async function handleBookingSubmit(event) {
    event.preventDefault();

    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const serviceName = document.getElementById('inputService').value;
    const servicePrice = parseInt(document.getElementById('inputPrice').value);
    const bookingDate = document.getElementById('bookingDate').value;
    const staffSelect = document.getElementById('staffSelect').value;
    const noteInput = document.getElementById('customerNote').value.trim();
    const voucherInput = document.getElementById('inputVoucherCode') ? document.getElementById('inputVoucherCode').value.trim() : '';

    if (!customerName || !customerPhone) {
        alert('Vui lòng nhập Họ tên và Số điện thoại!');
        return;
    }

    let finalNote = noteInput;
    if (voucherInput) {
        finalNote += ` [Mã ưu đãi: ${voucherInput}]`;
    }

    const payload = {
        customerName: customerName,
        customerPhone: customerPhone,
        serviceName: serviceName,
        servicePrice: servicePrice,
        date: bookingDate,
        time: selectedTimeSlot,
        staff: staffSelect,
        note: finalNote
    };

    try {
        const response = await fetch(API_BASE_URL + 'bookings.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === 'success') {
            closeBookingModal();
            showSuccessPopup(result.data);
        } else {
            alert('Lỗi đặt lịch: ' + result.message);
        }
    } catch (e) {
        payload.code = 'AURA-' + Math.floor(1000 + Math.random() * 9000);
        payload.status = 'Pending';
        closeBookingModal();
        showSuccessPopup(payload);
    }
}

// Hiển thị Popup Đặt Lịch Thành Công
function showSuccessPopup(data) {
    const successModal = document.getElementById('successModal');
    if (!successModal) return;

    document.getElementById('resCode').innerText = data.code;
    document.getElementById('resName').innerText = data.customerName;
    document.getElementById('resService').innerText = data.serviceName;
    document.getElementById('resTime').innerText = `${data.time} - ${data.date}`;
    document.getElementById('resStaff').innerText = data.staff;
    document.getElementById('resPrice').innerText = data.servicePrice.toLocaleString('vi-VN') + ' đ';

    successModal.classList.remove('hidden');
    successModal.classList.add('flex');
}

function closeSuccessPopup() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.add('hidden');
        successModal.classList.remove('flex');
    }
}

// ==========================================
// 🔍 CHỨC NĂNG TRA CỨU & HỦY LỊCH CHO KHÁCH HÀNG
// ==========================================

function openLookupModal() {
    const modal = document.getElementById('lookupModal');
    if (!modal) return;

    const mobileMenu = document.getElementById('mobileMenuDrawer');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
    }

    document.getElementById('lookupInput').value = '';
    document.getElementById('lookupResultArea').classList.add('hidden');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeLookupModal() {
    const modal = document.getElementById('lookupModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

async function handleLookupSearch() {
    const query = document.getElementById('lookupInput').value.trim().toUpperCase();
    if (!query) {
        alert('Vui lòng nhập Mã lịch hẹn hoặc Số điện thoại!');
        return;
    }

    const resultArea = document.getElementById('lookupResultArea');
    const resultList = document.getElementById('lookupResultList');

    try {
        let url = API_BASE_URL + 'bookings.php?';
        if (query.startsWith('AURA-')) {
            url += 'code=' + encodeURIComponent(query);
        } else {
            url += 'phone=' + encodeURIComponent(query);
        }

        const response = await fetch(url);
        const res = await response.json();
        const results = (res.status === 'success' && res.data) ? res.data : [];

        if (results.length === 0) {
            resultList.innerHTML = `<p class="text-center text-red-500 text-xs py-4">❌ Không tìm thấy lịch hẹn phù hợp với thông tin "${query}".</p>`;
        } else {
            resultList.innerHTML = results.map(b => `
                <div class="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 space-y-2 text-xs">
                    <div class="flex justify-between items-center border-b border-rose-200/60 pb-2">
                        <span class="font-extrabold text-rose-600 text-sm">${b.code}</span>
                        <span>${getStatusBadgeHTML(b.status)}</span>
                    </div>
                    <div class="space-y-1 text-gray-700">
                        <p><strong>Khách hàng:</strong> ${b.customerName} (${b.customerPhone})</p>
                        <p><strong>Dịch vụ:</strong> ${b.serviceName} - <span class="text-rose-600 font-bold">${b.servicePrice.toLocaleString('vi-VN')} đ</span></p>
                        <p><strong>Thời gian:</strong> ⏰ ${b.time} | 📅 ${b.date}</p>
                        <p><strong>KTV phụ trách:</strong> ${b.staff}</p>
                        ${b.note ? `<p class="text-[11px] text-gray-500 italic">Ghi chú: ${b.note}</p>` : ''}
                    </div>
                    ${(b.status === 'Pending' || b.status === 'Confirmed') ? `
                        <div class="pt-2 border-t border-rose-200/60 text-right">
                            <button onclick="cancelBookingByCustomer('${b.code}')" class="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-sm">
                                ✕ Hủy Lịch Hẹn Này
                            </button>
                        </div>
                    ` : `<p class="text-[10px] text-gray-400 text-right italic">Không thể hủy đơn ở trạng thái này</p>`}
                </div>
            `).join('');
        }

    } catch (e) {
        resultList.innerHTML = `<p class="text-center text-red-500 text-xs py-4">❌ Lỗi kết nối Server khi tìm đơn.</p>`;
    }

    resultArea.classList.remove('hidden');
}

async function cancelBookingByCustomer(code) {
    if (!confirm(`Bạn có chắc chắn muốn HỦY lịch hẹn ${code} không?`)) return;

    try {
        const response = await fetch(API_BASE_URL + 'bookings.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: code,
                status: 'Cancelled',
                note: '(Khách tự hủy qua tra cứu)'
            })
        });

        const res = await response.json();
        if (res.status === 'success') {
            alert(`Đã hủy lịch hẹn ${code} thành công!`);
            handleLookupSearch();
        } else {
            alert('Lỗi hủy lịch: ' + res.message);
        }
    } catch (e) {
        alert('Lỗi kết nối Server!');
    }
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
