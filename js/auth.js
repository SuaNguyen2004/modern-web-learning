// ==========================================
// AURA SPA - AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
// ==========================================

const AUTH_API_URL = 'api/auth.php';

// Lấy thông tin User đang đăng nhập
function getCurrentUser() {
    const userStr = localStorage.getItem('aura_user');
    return userStr ? JSON.parse(userStr) : null;
}

// Đăng xuất khỏi hệ thống
function handleLogout() {
    if (confirm('Bạn có chắc chắn muốn Đăng xuất khỏi hệ thống không?')) {
        localStorage.removeItem('aura_user');
        localStorage.removeItem('aura_logged_customer');
        alert('Đã đăng xuất thành công.');
        window.location.href = 'index.html';
    }
}

// Bảo vệ trang (Page Access Guard)
function protectPage(allowedRoles = []) {
    const user = getCurrentUser();

    if (!user) {
        alert('🔒 Bạn cần Đăng Nhập để truy cập trang này!');
        window.location.href = 'index.html?auth=required';
        return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        alert(`⛔ Bạn không có quyền hạn (${user.role.toUpperCase()}) để vào trang này!`);
        window.location.href = 'index.html';
        return false;
    }

    return true;
}

// Toggle Mở/Đóng User Avatar Dropdown Menu
function toggleUserDropdown(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('userDropdownMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Tự động đóng Dropdown khi click ra ngoài
window.addEventListener('click', () => {
    const menu = document.getElementById('userDropdownMenu');
    if (menu && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
    }
});

// Cập nhật giao diện Header Siêu Tối Giản (Tự động Ẩn/Hiện theo Quyền Hạn)
function updateHeaderAuthNav() {
    const user = getCurrentUser();
    const navContainer = document.getElementById('navAuthContainer');
    const mobileNavContainer = document.getElementById('mobileNavAuthContainer');
    const headerBookingBtn = document.getElementById('headerBookingBtn');
    const heroBookingBtn = document.getElementById('heroBookingBtn');

    // 1. XỬ LÝ ẨN HOÀN TOÀN NÚT ĐẶT LỊCH KHI LÀ ADMIN HẶC KTV
    if (user && (user.role === 'admin' || user.role === 'ktv')) {
        if (headerBookingBtn) headerBookingBtn.classList.add('hidden');
        if (heroBookingBtn) {
            heroBookingBtn.innerText = '⚙️ Đến Trang Quản Lý Spa';
            heroBookingBtn.onclick = function() { window.location.href = 'spa_admin.html'; };
        }
    } else {
        if (headerBookingBtn) headerBookingBtn.classList.remove('hidden');
        if (heroBookingBtn) {
            heroBookingBtn.innerText = 'Đặt Lịch Hẹn Ngay 🌸';
            heroBookingBtn.onclick = function() { openBookingModal(); };
        }
    }

    if (!navContainer && !mobileNavContainer) return;

    if (!user) {
        // TRẠNG THÁI: CHƯA ĐĂNG NHẬP (GUEST)
        const guestHTML = `
            <button onclick="openAuthModal()" class="flex items-center gap-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 px-4 py-2.5 rounded-full shadow-md transition active:scale-95 whitespace-nowrap">
                <span>🔑</span> Đăng Nhập / Đăng Ký
            </button>
        `;

        if (navContainer) navContainer.innerHTML = guestHTML;

        if (mobileNavContainer) {
            mobileNavContainer.innerHTML = `
                <button onclick="openAuthModal(); toggleMobileMenu();" class="w-full bg-rose-600 text-white font-bold px-4 py-3 rounded-xl text-center flex items-center justify-center gap-2 shadow-md text-xs">
                    <span>🔑</span> Đăng Nhập / Đăng Ký Tài Khoản
                </button>
            `;
        }
    } else {
        // TRẠNG THÁI: ĐÃ ĐĂNG NHẬP
        let roleBadge = '';
        let targetPage = 'customer.html';
        let pageBtnText = 'Trang VIP Khách Hàng';
        let pageBtnIcon = '👑';

        if (user.role === 'admin') {
            roleBadge = `<span class="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">ADMIN</span>`;
            targetPage = 'spa_admin.html';
            pageBtnText = 'Trang Quản Lý Admin';
            pageBtnIcon = '⚙️';
        } else if (user.role === 'ktv') {
            roleBadge = `<span class="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">KTV</span>`;
            targetPage = 'spa_admin.html';
            pageBtnText = 'Lịch Phục Vụ KTV';
            pageBtnIcon = '📋';
        } else {
            roleBadge = `<span class="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">${user.rank_badge || 'VIP GOLD'}</span>`;
            targetPage = 'customer.html';
            pageBtnText = 'Trang VIP Cá Nhân';
            pageBtnIcon = '👑';
        }

        const userHTML = `
            <div class="relative">
                <button onclick="toggleUserDropdown(event)" class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white pl-2 pr-3 py-1.5 rounded-full shadow-md transition text-xs font-bold border border-slate-800">
                    <span class="w-6 h-6 rounded-full bg-rose-500 text-white font-extrabold text-[11px] flex items-center justify-center shadow-inner">
                        ${user.name ? user.name.charAt(0) : 'U'}
                    </span>
                    <span class="truncate max-w-[100px]">${user.name}</span>
                    <span class="text-[10px] text-slate-400">▼</span>
                </button>

                <!-- DROPDOWN MENU ẨN NỘI DUNG -->
                <div id="userDropdownMenu" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-rose-100 py-2 z-50 animate-fade-in text-xs">
                    <div class="px-4 py-2.5 border-b border-gray-100 space-y-1">
                        <p class="font-extrabold text-gray-900 truncate">${user.name}</p>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[10px] text-gray-400">📞 ${user.phone}</span>
                            ${roleBadge}
                        </div>
                    </div>

                    <div class="py-1">
                        <a href="${targetPage}" class="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-rose-50 hover:text-rose-600 font-bold transition">
                            <span>${pageBtnIcon}</span> ${pageBtnText}
                        </a>
                        <button onclick="openLookupModal()" class="w-full text-left flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-rose-50 hover:text-rose-600 font-bold transition">
                            <span>🔍</span> Tra Cứu & Hủy Lịch Hẹn
                        </button>
                    </div>

                    <div class="pt-1 border-t border-gray-100">
                        <button onclick="handleLogout()" class="w-full text-left flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 font-bold transition">
                            <span>🚪</span> Đăng Xuất Tài Khoản
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (navContainer) navContainer.innerHTML = userHTML;

        if (mobileNavContainer) {
            mobileNavContainer.innerHTML = `
                <div class="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-2 text-xs">
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-gray-900">👤 ${user.name}</span>
                        ${roleBadge}
                    </div>
                    <div class="pt-2 border-t border-rose-200/60 flex flex-col gap-2">
                        <a href="${targetPage}" class="bg-rose-600 text-white font-bold px-3.5 py-2.5 rounded-xl text-center flex items-center justify-center gap-2 text-xs">
                            <span>${pageBtnIcon}</span> ${pageBtnText}
                        </a>
                        <button onclick="handleLogout()" class="bg-red-50 text-red-600 font-bold px-3.5 py-2.5 rounded-xl text-center border border-red-200 text-xs">
                            🚪 Đăng Xuất
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Mở Modal Auth
function openAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    if (!modal) return;

    switchAuthTab(tab);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginFormArea');
    const registerForm = document.getElementById('registerFormArea');
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');

    if (tab === 'login') {
        if (loginForm) loginForm.classList.remove('hidden');
        if (registerForm) registerForm.classList.add('hidden');
        if (tabLoginBtn) {
            tabLoginBtn.classList.add('border-rose-600', 'text-rose-600', 'font-extrabold');
            tabLoginBtn.classList.remove('text-gray-400');
        }
        if (tabRegisterBtn) {
            tabRegisterBtn.classList.remove('border-rose-600', 'text-rose-600', 'font-extrabold');
            tabRegisterBtn.classList.add('text-gray-400');
        }
    } else {
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.remove('hidden');
        if (tabRegisterBtn) {
            tabRegisterBtn.classList.add('border-rose-600', 'text-rose-600', 'font-extrabold');
            tabRegisterBtn.classList.remove('text-gray-400');
        }
        if (tabLoginBtn) {
            tabLoginBtn.classList.remove('border-rose-600', 'text-rose-600', 'font-extrabold');
            tabLoginBtn.classList.add('text-gray-400');
        }
    }
}

// Xử lý Form Đăng Nhập
async function submitLoginForm(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) {
        alert('Vui lòng nhập đầy đủ Tài khoản và Mật khẩu!');
        return;
    }

    try {
        const response = await fetch(AUTH_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'login',
                username: username,
                password: password
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            localStorage.setItem('aura_user', JSON.stringify(result.user));

            if (result.user.role === 'customer') {
                localStorage.setItem('aura_logged_customer', JSON.stringify({
                    name: result.user.name,
                    phone: result.user.phone,
                    rank: result.user.rank_badge
                }));
            }

            closeAuthModal();
            updateHeaderAuthNav();
            alert(`🎉 Chào mừng ${result.user.name} (${result.user.role.toUpperCase()}) đăng nhập thành công!`);

            // Chuyển màn hình theo Quyền Hạn RBAC
            if (result.user.role === 'admin' || result.user.role === 'ktv') {
                window.location.href = 'spa_admin.html';
            } else if (result.user.role === 'customer') {
                window.location.href = 'customer.html';
            }
        } else {
            alert('❌ Đăng nhập thất bại: ' + result.message);
        }
    } catch (e) {
        alert('Lỗi kết nối Server!');
    }
}

// Xử lý Form Đăng Ký Khách Hàng
async function submitRegisterForm(event) {
    event.preventDefault();

    const fullName = document.getElementById('regFullName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    if (!fullName || !phone || !password) {
        alert('Vui lòng nhập đầy đủ Họ tên, SĐT và Mật khẩu!');
        return;
    }

    try {
        const response = await fetch(AUTH_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'register',
                fullName: fullName,
                phone: phone,
                password: password
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            localStorage.setItem('aura_user', JSON.stringify(result.user));
            localStorage.setItem('aura_logged_customer', JSON.stringify({
                name: result.user.name,
                phone: result.user.phone,
                rank: result.user.rank_badge
            }));

            closeAuthModal();
            updateHeaderAuthNav();
            alert(result.message);
            window.location.href = 'customer.html';
        } else {
            alert('❌ Đăng ký thất bại: ' + result.message);
        }
    } catch (e) {
        alert('Lỗi kết nối Server!');
    }
}

// Nút Đăng Nhập Nhanh Mẫu Cho Demo
function quickDemoLogin(role) {
    if (role === 'admin') {
        document.getElementById('loginUsername').value = 'admin';
        document.getElementById('loginPassword').value = 'admin123';
    } else if (role === 'ktv') {
        document.getElementById('loginUsername').value = 'ktv_minhanh';
        document.getElementById('loginPassword').value = 'ktv123';
    } else if (role === 'customer') {
        document.getElementById('loginUsername').value = '0908123456';
        document.getElementById('loginPassword').value = '123456';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateHeaderAuthNav();

    // Kiểm tra URL nếu có yêu cầu đăng nhập
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'required') {
        openAuthModal('login');
    }
});
