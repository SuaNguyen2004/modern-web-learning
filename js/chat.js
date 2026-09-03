// ==========================================
// SPA ONLINE LIVE CHAT SCRIPT (FETCH API & MYSQL CONNECTED)
// ==========================================

const CHAT_API_URL = 'api/chat.php';

function toggleChatWidget() {
    const chatBox = document.getElementById('chatBoxWidget');
    if (!chatBox) return;

    if (chatBox.classList.contains('hidden')) {
        chatBox.classList.remove('hidden');
        chatBox.classList.add('flex');
        renderChatMessages();
    } else {
        chatBox.classList.add('hidden');
        chatBox.classList.remove('flex');
    }
}

async function renderChatMessages() {
    const chatBody = document.getElementById('chatMessagesBody');
    if (!chatBody) return;

    try {
        const response = await fetch(CHAT_API_URL);
        const res = await response.json();
        const messages = (res.status === 'success' && res.data) ? res.data : [];

        chatBody.innerHTML = messages.map(msg => {
            const isCustomer = msg.sender === 'customer';
            return `
                <div class="flex flex-col ${isCustomer ? 'items-end' : 'items-start'} mb-3">
                    <span class="text-[10px] text-gray-400 font-semibold mb-1 px-1">
                        ${isCustomer ? '👤 Bạn' : '🌸 ' + (msg.sender_name || 'Lễ Tân AuraSpa')} • ${msg.time}
                    </span>
                    <div class="${isCustomer ? 'bg-rose-600 text-white rounded-2xl rounded-tr-none shadow-sm' : 'bg-white text-gray-800 border border-rose-100 rounded-2xl rounded-tl-none shadow-sm'} p-3 max-w-[85%] leading-relaxed text-xs">
                        ${msg.message_text || msg.text}
                    </div>
                </div>
            `;
        }).join('');

        chatBody.scrollTop = chatBody.scrollHeight;
    } catch (e) {
        console.error('Lỗi tải tin nhắn Chat:', e);
    }
}

async function handleCustomerSendChat(event) {
    event.preventDefault();
    const input = document.getElementById('customerChatInput');
    const text = input.value.trim();
    if (!text) return;

    try {
        // Gửi tin nhắn của Khách lên MySQL
        await fetch(CHAT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender: 'customer',
                senderName: 'Khách Hàng',
                text: text
            })
        });

        input.value = '';
        await renderChatMessages();

        // Tự động phản hồi Chat Bot nếu cần
        setTimeout(async () => {
            const autoReply = generateSmartReply(text);
            if (autoReply) {
                await fetch(CHAT_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sender: 'spa',
                        senderName: 'Lễ Tân AuraSpa (Tự động)',
                        text: autoReply
                    })
                });
                renderChatMessages();
            }
        }, 1000);

    } catch (e) {
        console.error('Lỗi gửi tin nhắn:', e);
    }
}

function generateSmartReply(userText) {
    const lower = userText.toLowerCase();

    if (lower.includes('giá') || lower.includes('nhiêu') || lower.includes('tiền')) {
        return "Dạ dịch vụ Gội đầu dưỡng sinh của bên em có giá 199.000đ/60 phút, Chăm sóc da chuyên sâu giá 350.000đ/75 phút ạ! Bạn có thể nhấn nút 'Đặt Lịch Ngay' ở trên để chọn giờ hẹn phù hợp nhé 🌸";
    }
    if (lower.includes('địa chỉ') || lower.includes('ở đâu') || lower.includes('chỉ đường')) {
        return "AuraSpa tọa lạc tại: Số 123 Đường Hoa Hồng, Phường 2, Q. Phú Nhuận, TP.HCM. Mở cửa từ 08:30 - 20:30 tất cả các ngày trong tuần ạ! ✨";
    }
    if (lower.includes('đặt lịch') || lower.includes('đặt hẹn') || lower.includes('mấy giờ')) {
        return "Dạ bạn có thể nhấn vào nút '📅 Đặt Lịch Ngay' trên góc màn hình để đăng ký khung giờ hẹn mượt mà không lo phải chờ đợi ạ! ❤️";
    }

    return "Cảm ơn bạn đã nhắn tin cho AuraSpa! Lễ tân bên em đã nhận được tin nhắn và sẽ gọi lại hỗ trợ bạn ngay trong ít phút ạ! ✨";
}
