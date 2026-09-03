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

// Cập nhật giao diện Header gọn gàng không bị vỡ layout
function updateHeaderAuthNav() {
    const user = getCurrentUser();
    const navContainer = document.getElementById('navAuthContainer');
    const mobileNavContainer = document.getElementById('mobileNavAuthContainer');

    if (!navContainer && !mobileNavContainer) return;

    if (!user) {
        // TRẠNG THÁI: CHƯA ĐĂNG NHẬP (GUEST)
        const guestHTML = `
            <button onclick="openAuthModal()" class="flex items-center gap-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 px-4 py-2 rounded-full shadow-md transition active:scale-95 whitespace-nowrap">
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
        // TRẠNG THÁI: ĐÃ ĐĂNG NHẬP (GỌN GÀNG GỌN TRONG 1 THẺ PILL SANG TRỌNG)
        let roleBadge = '';
        let targetPage = 'customer.html';
        let pageBtnText = '👑 Trang VIP';

        if (user.role === 'admin') {
            roleBadge = `<span class="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap">ADMIN</span>`;
            targetPage = 'spa_admin.html';
            pageBtnText = '⚙️ Trang Quản Lý';
        } else if (user.role === 'ktv') {
            roleBadge = `<span class="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap">KTV</span>`;
            targetPage = 'spa_admin.html';
            pageBtnText = '📋 Lịch Phục Vụ';
        } else {
            roleBadge = `<span class="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap">${user.rank_badge || 'VIP'}</span>`;
            targetPage = 'customer.html';
            pageBtnText = '👑 Trang VIP';
        }

        const userHTML = `
            <div class="flex items-center gap-2 bg-slate-900 text-white pl-1.5 pr-2.5 py-1 rounded-full shadow-md border border-slate-800 text-xs whitespace-nowrap">
                <span class="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-[11px] flex items-center justify-center shadow-inner">
                    ${user.name ? user.name.charAt(0) : 'U'}
                </span>
                <span class="font-bold text-xs truncate max-w-[110px]">${user.name}</span>
                ${roleBadge}
                <a href="${targetPage}" class="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1 rounded-full transition shadow-sm whitespace-nowrap ml-0.5">
                    ${pageBtnText}
                </a>
                <button onclick="handleLogout()" class="text-slate-400 hover:text-red-400 p-1 font-bold text-xs transition" title="Đăng Xuất">
                    🚪
                </button>
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
                    <div class="pt-2 border-t border-rose-200/60 flex items-center justify-between gap-2">
                        <a href="${targetPage}" class="bg-rose-600 text-white font-bold px-3.5 py-2 rounded-xl text-center text-[11px] flex-1">
                            ${pageBtnText}
                        </a>
                        <button onclick="handleLogout()" class="bg-red-50 text-red-600 font-bold px-3.5 py-2 rounded-xl text-center text-[11px] border border-red-200">
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
