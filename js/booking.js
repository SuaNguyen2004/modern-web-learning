// ==========================================
// SPA BOOKING & FEEDBACK INTERACTIVE SCRIPT
// ==========================================

// Danh sách Kỹ thuật viên mẫu
const STAFF_LIST = [
    { id: 1, name: 'Nguyễn Minh Anh', role: 'Chuyên gia Da', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', rating: '4.9 ⭐' },
    { id: 2, name: 'Trần Thu Hà', role: 'Chuyên gia Gội đầu', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80', rating: '5.0 ⭐' },
    { id: 3, name: 'Lê Ngọc Lan', role: 'KTV Trị liệu', avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80', rating: '4.8 ⭐' }
];

// Mở Modal Đặt Lịch
function openBookingModal(serviceName = 'Gội Đầu Dưỡng Sinh Thảo Dược', price = 199000) {
    const modal = document.getElementById('bookingModal');
    if (!modal) return;

    // Cập nhật dịch vụ đã chọn
    document.getElementById('selectedServiceName').innerText = serviceName;
    document.getElementById('selectedServicePrice').innerText = price.toLocaleString('vi-VN') + ' đ';
    document.getElementById('inputService').value = serviceName;
    document.getElementById('inputPrice').value = price;

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

    // Sinh mã lịch hẹn ngẫu nhiên (VD: AURA-8942)
    const bookingCode = 'AURA-' + Math.floor(1000 + Math.random() * 9000);

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
