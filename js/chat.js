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
        // Cuộn xuống cuối
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
                <span class="text-[10px] text-gray-400 mb-1 px-1">${msg.senderName || (isCustomer ? 'Bạn' : 'AuraSpa')} • ${msg.time}</span>
                <div class="${isCustomer ? 'bg-rose-600 text-white rounded-2xl rounded-tr-none' : 'bg-white text-gray-800 border border-rose-100 rounded-2xl rounded-tl-none shadow-sm'} p-3 max-w-[80%] text-xs leading-relaxed">
                    ${msg.text}
                </div>
            </div>
        `;
    }).join('');

    scrollChatToBottom();
}

// Cuộn khung chat xuống tin nhắn mới nhất
function scrollChatToBottom() {
    const chatBody = document.getElementById('chatMessagesBody');
    if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
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

    // Tự động trả lời mẫu nếu là tin nhắn đầu tiên (Mô phỏng nhân viên phản hồi)
    setTimeout(() => {
        const updatedMessages = getStoredChat();
        const lastMsg = updatedMessages[updatedMessages.length - 1];

        // Nếu tin cuối vẫn là của khách (Admin chưa trả lời) thì gửi câu trả lời tự động
        if (lastMsg && lastMsg.sender === 'customer') {
            updatedMessages.push({
                sender: 'spa',
                senderName: 'Lễ Tân AuraSpa',
                text: 'Cảm ơn bạn đã nhắn tin ạ! Chuyên viên AuraSpa đang chuẩn bị tư vấn cho bạn ngay đây ạ ✨',
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            });
            saveChat(updatedMessages);
        }
    }, 1500);
}

// Lắng nghe sự thay đổi từ tab khác (Tự động cập nhật khi Admin trả lời)
window.addEventListener('storage', (e) => {
    if (e.key === 'aura_chat_messages') {
        renderChatMessages();
    }
});

// Khởi chạy khi load trang
document.addEventListener('DOMContentLoaded', () => {
    renderChatMessages();
});
