// ==========================================
// AURA SPA LIVE CHAT SCRIPT (CLIENT SIDE)
// ==========================================

const INITIAL_WELCOME_CHAT = [
    {
        sender: 'spa',
        senderName: 'AuraSpa Support',
        text: 'Xin chào bạn! 🌸 AuraSpa có thể hỗ trợ tư vấn dịch vụ gội đầu hay chăm sóc da nào cho bạn hôm nay ạ?',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
];

// Lấy lịch sử chat từ localStorage
function getStoredChat() {
    let stored = localStorage.getItem('aura_chat_messages');
    if (!stored) {
        localStorage.setItem('aura_chat_messages', JSON.stringify(INITIAL_WELCOME_CHAT));
        return INITIAL_WELCOME_CHAT;
    }
    return JSON.parse(stored);
}

// Lưu lịch sử chat
function saveChat(messages) {
    localStorage.setItem('aura_chat_messages', JSON.stringify(messages));
    renderChatMessages();
}

// Toggle Mở/Đóng Khung Chat
function toggleChatWidget() {
    const chatBox = document.getElementById('chatBoxWidget');
    if (!chatBox) return;

    if (chatBox.classList.contains('hidden')) {
        chatBox.classList.remove('hidden');
        chatBox.classList.add('flex');
        renderChatMessages();
        scrollChatToBottom();
    } else {
        chatBox.classList.add('hidden');
        chatBox.classList.remove('flex');
    }
}

// Render tin nhắn ra khung chat
function renderChatMessages() {
    const chatBody = document.getElementById('chatMessagesBody');
    if (!chatBody) return;

    const messages = getStoredChat();

    chatBody.innerHTML = messages.map(msg => {
        const isCustomer = msg.sender === 'customer';
        return `
            <div class="flex flex-col ${isCustomer ? 'items-end' : 'items-start'} mb-3">
                <span class="text-[10px] text-gray-400 mb-1 px-1">${msg.senderName || (isCustomer ? 'Khách Hàng' : 'AuraSpa')} • ${msg.time}</span>
                <div class="${isCustomer ? 'bg-rose-600 text-white rounded-2xl rounded-tr-none' : 'bg-white text-gray-800 border border-rose-100 rounded-2xl rounded-tl-none shadow-sm'} p-3 max-w-[80%] text-xs leading-relaxed">
                    ${msg.text}
                </div>
            </div>
        `;
    }).join('');

    scrollChatToBottom();
}

// Cuộn khung chat xuống cuối
function scrollChatToBottom() {
    const chatBody = document.getElementById('chatMessagesBody');
    if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

// Hàm tư vấn tự động thông minh dựa trên từ khóa (Smart Auto-Reply Bot)
function generateSmartReply(userText) {
    const textLower = userText.toLowerCase();

    if (textLower.includes('giá') || textLower.includes('bao nhiêu') || textLower.includes('tiền')) {
        return 'Dạ các dịch vụ bên em đang có giá rất ưu đãi ạ:\n• Gội đầu dưỡng sinh: 199k (60p)\n• Chăm sóc da chuyên sâu: 350k (75p)\n• Massage cổ vai gáy: 250k (45p)\n• Combo VIP: 499k (90p) 🌸';
    } else if (textLower.includes('gội đầu') || textLower.includes('dưỡng sinh')) {
        return 'Dạ gói Gội đầu dưỡng sinh thảo dược (199k - 60 phút) sử dụng nước bồ kết nấu tươi kết hợp vòm nước massage 360 độ giúp giảm căng thẳng cực kỳ thoải mái ạ!';
    } else if (textLower.includes('da') || textLower.includes('mặt') || textLower.includes('mụn')) {
        return 'Dạ liệu trình Chăm sóc da mặt chuyên sâu (350k - 75 phút) sẽ bao gồm bước soi da 3D, hút mụn cám và điện di Vitamin C giúp da căng bóng sáng mịn ạ!';
    } else if (textLower.includes('giờ') || textLower.includes('mở cửa') || textLower.includes('địa chỉ')) {
        return 'Dạ AuraSpa mở cửa từ 08:30 - 20:30 (Thứ 2 đến CN). Địa chỉ tại: Số 123 Đường Hoa Hồng, Phường 2, Q. Phú Nhuận, TP.HCM ạ!';
    } else if (textLower.includes('tư vấn') || textLower.includes('chưa') || textLower.includes('alo')) {
        return 'Dạ em Lễ tân AuraSpa đây ạ! Anh/chị cần tư vấn gói chăm sóc da hay gội đầu dưỡng sinh ạ? Em sẵn sàng giải đáp ngay ạ ✨';
    } else {
        return 'Dạ em đã nhận được tin nhắn của anh/chị ạ! Chuyên viên Lễ tân Spa đang trả lời anh/chị ngay đây ạ ✨';
    }
}

// Gửi tin nhắn từ phía Khách Hàng
function handleCustomerSendChat(event) {
    event.preventDefault();
    const input = document.getElementById('customerChatInput');
    const text = input.value.trim();

    if (!text) return;

    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const messages = getStoredChat();

    // Thêm tin nhắn của Khách
    messages.push({
        sender: 'customer',
        senderName: 'Khách Hàng',
        text: text,
        time: nowTime
    });

    input.value = '';
    saveChat(messages);

    // Tự động trả lời thông minh dựa trên từ khóa khách nhập
    setTimeout(() => {
        const updatedMessages = getStoredChat();
        const lastMsg = updatedMessages[updatedMessages.length - 1];

        // Nếu tin nhắn cuối vẫn là của khách (Admin chưa trả lời trực tiếp)
        if (lastMsg && lastMsg.sender === 'customer') {
            const replyText = generateSmartReply(text);
            updatedMessages.push({
                sender: 'spa',
                senderName: 'Lễ Tân AuraSpa',
                text: replyText,
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            });
            saveChat(updatedMessages);
        }
    }, 1000);
}

// Lắng nghe sự thay đổi từ tab khác (Tự động cập nhật khi Admin trả lời từ spa_admin.html)
window.addEventListener('storage', (e) => {
    if (e.key === 'aura_chat_messages') {
        renderChatMessages();
    }
});

// Khởi chạy khi load trang
document.addEventListener('DOMContentLoaded', () => {
    renderChatMessages();
});
