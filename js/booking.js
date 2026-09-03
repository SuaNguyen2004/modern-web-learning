// ==========================================
// SPA BOOKING & FEEDBACK INTERACTIVE SCRIPT
// ==========================================

// Bảng danh sách dịch vụ Spa & Giá tiền
const SERVICES_LIST = [
    { name: 'Gội Đầu Dưỡng Sinh Thảo Dược', price: 199000, duration: '60 Phút' },
    { name: 'Chăm Sóc Da Mặt Chuyên Sâu', price: 350000, duration: '75 Phút' },
    { name: 'Massage Cổ Vai Gáy Trị Liệu', price: 250000, duration: '45 Phút' },
    { name: 'Combo Chăm Sóc Da & Gội Đầu VIP', price: 499000, duration: '90 Phút' }
];

// Khởi tạo phiên Đăng Nhập Mặc Định Khách VIP nếu chưa có
function getLoggedInCustomer() {
    let logged = localStorage.getItem('aura_logged_customer');
    if (!logged) {
        const defaultVIP = { name: 'Nguyễn Thanh Hằng', phone: '0908123456', rank: 'VIP GOLD' };
        localStorage.setItem('aura_logged_customer', JSON.stringify(defaultVIP));
        return defaultVIP;
    }
    return JSON.parse(logged);
}

// Mở Modal Đặt Lịch (Tự động điền Họ Tên & SĐT nếu đã đăng nhập)
function openBookingModal(serviceName = null, price = null, voucherCode = null) {
    const modal = document.getElementById('bookingModal');
    if (!modal) return;

    const serviceSelect = document.getElementById('serviceSelect');
    if (serviceSelect) {
        if (serviceName) {
            serviceSelect.value = serviceName;
        } else {
            serviceSelect.value = SERVICES_LIST[0].name;
        }
        updateSelectedServicePrice();
    }

    // Tự động điền Voucher nếu có
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

    // ⚡ KIỂM TRA PHIÊN KHÁCH HÀNG ĐÃ ĐĂNG NHẬP VIP ⚡
    const loggedCustomer = getLoggedInCustomer();
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const vipBadge = document.getElementById('vipStatusNotice');

    if (loggedCustomer && loggedCustomer.name && loggedCustomer.phone) {
        if (nameInput) {
            nameInput.value = loggedCustomer.name;
            nameInput.readOnly = true;
            nameInput.classList.add('bg-slate-100', 'text-slate-700', 'font-bold', 'cursor-not-allowed');
        }
        if (phoneInput) {
            phoneInput.value = loggedCustomer.phone;
            phoneInput.readOnly = true;
            phoneInput.classList.add('bg-slate-100', 'text-slate-700', 'font-bold', 'cursor-not-allowed');
        }
        if (vipBadge) {
            vipBadge.innerText = `✨ Tự động nhận diện: Khách hàng ${loggedCustomer.rank || 'VIP'} (${loggedCustomer.name})`;
            vipBadge.classList.remove('hidden');
        }
    } else {
        if (nameInput) {
            nameInput.readOnly = false;
            nameInput.classList.remove('bg-slate-100', 'cursor-not-allowed');
        }
        if (phoneInput) {
            phoneInput.readOnly = false;
            phoneInput.classList.remove('bg-slate-100', 'cursor-not-allowed');
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

// Sinh Mã đơn ĐỘC NHẤT
function generateUniqueBookingCode() {
    let existingBookings = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
    let existingCodes = new Set(existingBookings.map(b => b.code));
    let newCode;
    
    do {
        newCode = 'AURA-' + Math.floor(1000 + Math.random() * 9000);
    } while (existingCodes.has(newCode));

    return newCode;
}

// Xử lý gửi Form Đặt Lịch
function handleBookingSubmit(event) {
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

    const bookingCode = generateUniqueBookingCode();
    let finalNote = noteInput;
    if (voucherInput) {
        finalNote += ` [Mã ưu đãi: ${voucherInput}]`;
    }

    const bookingData = {
        code: bookingCode,
        customerName: customerName,
        customerPhone: customerPhone,
        serviceName: serviceName,
        servicePrice: servicePrice,
        date: bookingDate,
        time: selectedTimeSlot,
        staff: staffSelect,
        note: finalNote,
        status: 'Pending',
        createdAt: new Date().toLocaleString('vi-VN')
    };

    let existingBookings = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
    existingBookings.unshift(bookingData);
    localStorage.setItem('aura_bookings', JSON.stringify(existingBookings));

    closeBookingModal();
    showSuccessPopup(bookingData);
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

function handleLookupSearch() {
    const query = document.getElementById('lookupInput').value.trim().toUpperCase();
    if (!query) {
        alert('Vui lòng nhập Mã lịch hẹn hoặc Số điện thoại!');
        return;
    }

    let existingBookings = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
    const results = existingBookings.filter(b => b.code === query || b.customerPhone === query);

    const resultArea = document.getElementById('lookupResultArea');
    const resultList = document.getElementById('lookupResultList');

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

    resultArea.classList.remove('hidden');
}

function cancelBookingByCustomer(code) {
    if (!confirm(`Bạn có chắc chắn muốn HỦY lịch hẹn ${code} không?`)) return;

    let existingBookings = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
    const index = existingBookings.findIndex(b => b.code === code);

    if (index !== -1) {
        existingBookings[index].status = 'Cancelled';
        existingBookings[index].note = (existingBookings[index].note || '') + ' (Khách hàng tự hủy)';
        localStorage.setItem('aura_bookings', JSON.stringify(existingBookings));

        alert(`Đã hủy lịch hẹn ${code} thành công!`);
        handleLookupSearch();
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
