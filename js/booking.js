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

// Danh sách Kỹ thuật viên mẫu
const STAFF_LIST = [
    { id: 1, name: 'Nguyễn Minh Anh', role: 'Chuyên gia Da', rating: '4.9 ⭐' },
    { id: 2, name: 'Trần Thu Hà', role: 'Chuyên gia Gội đầu', rating: '5.0 ⭐' },
    { id: 3, name: 'Lê Ngọc Lan', role: 'KTV Trị liệu', rating: '4.8 ⭐' }
];

// Mở Modal Đặt Lịch
function openBookingModal(serviceName = null, price = null) {
    const modal = document.getElementById('bookingModal');
    if (!modal) return;

    const serviceSelect = document.getElementById('serviceSelect');
    if (serviceSelect) {
        if (serviceName) {
            serviceSelect.value = serviceName;
        } else {
            // Mặc định chọn dịch vụ đầu tiên nếu mở từ Thanh Navigator
            serviceSelect.value = SERVICES_LIST[0].name;
        }
        updateSelectedServicePrice();
    }

    // Thiết lập ngày mặc định là hôm nay
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        dateInput.value = today;
        dateInput.min = today;
    }

    // Hiển thị Modal
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
    // Bỏ active tất cả các ô giờ
    document.querySelectorAll('.time-slot-btn').forEach(btn => {
        btn.classList.remove('bg-rose-600', 'text-white', 'border-rose-600');
        btn.classList.add('bg-gray-50', 'text-gray-700', 'border-gray-200');
    });

    // Active ô giờ được chọn
    element.classList.remove('bg-gray-50', 'text-gray-700', 'border-gray-200');
    element.classList.add('bg-rose-600', 'text-white', 'border-rose-600');
    selectedTimeSlot = time;
}

// Hàm sinh Mã đơn ĐỘC NHẤT (Không trùng lặp)
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
    const note = document.getElementById('customerNote').value.trim();

    if (!customerName || !customerPhone) {
        alert('Vui lòng nhập Họ tên và Số điện thoại!');
        return;
    }

    // Sinh mã đơn ĐỘC NHẤT không trùng lặp
    const bookingCode = generateUniqueBookingCode();

    const bookingData = {
        code: bookingCode,
        customerName: customerName,
        customerPhone: customerPhone,
        serviceName: serviceName,
        servicePrice: servicePrice,
        date: bookingDate,
        time: selectedTimeSlot,
        staff: staffSelect,
        note: note,
        status: 'Pending', // Trạng thái ban đầu: Chờ xác nhận
        createdAt: new Date().toLocaleString('vi-VN')
    };

    // Lưu vào LocalStorage để mô phỏng Database
    let existingBookings = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
    existingBookings.unshift(bookingData);
    localStorage.setItem('aura_bookings', JSON.stringify(existingBookings));

    // Đóng modal form
    closeBookingModal();

    // Hiển thị Popup xác nhận thành công
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

// Đóng Popup Thành công
function closeSuccessPopup() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.add('hidden');
        successModal.classList.remove('flex');
    }
}
