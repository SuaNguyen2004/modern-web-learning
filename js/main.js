// ==========================================
// BÀI HỌC JAVASCRIPT ES6+ CHO WEB DEVELOPER
// ==========================================

// 1. const & let (thay thế hoàn toàn var)
const API_URL = 'https://jsonplaceholder.typicode.com/posts/1';
let currentPage = 1;

// 2. Arrow Functions (Hàm mũi tên ngắn gọn)
const formatGreeting = (name, role = 'Lập trình viên') => {
    // 3. Template Literals (Chuỗi nội suy dùng dấu backtick `)
    return `Chào ${name}, bạn đang học lộ trình ${role} hiện đại!`;
};

console.log(formatGreeting('Sữa Nguyễn'));

// 4. Destructuring & Spread Operator (Bóc tách dữ liệu)
const student = {
    name: 'Sữa Nguyễn',
    age: 20,
    skills: ['HTML', 'CSS', 'PHP', 'MySQL']
};

// Bóc tách thuộc tính name và skills
const { name, skills } = student;
// Spread operator: thêm skill mới mà không sửa mảng cũ
const updatedSkills = [...skills, 'Git', 'ES6+', 'React'];

console.log('Kỹ năng mới:', updatedSkills);

// 5. Async / Await & Fetch API (Thay thế AJAX jQuery truyền thống)
const fetchSampleData = async () => {
    const appElement = document.getElementById('app');
    appElement.innerHTML = '<p>⏳ Đang tải dữ liệu từ API...</p>';

    try {
        // Gọi API bằng Fetch
        const response = await fetch(API_URL);
        const data = await response.json();

        // Bóc tách dữ liệu từ API JSON
        const { title, body, id } = data;

        // Hiển thị ra giao diện HTML
        appElement.innerHTML = `
            <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; background: #f9f9f9;">
                <span style="background: #007bff; color: white; padding: 2px 8px; border-radius: 4px;">Bài viết #${id}</span>
                <h3 style="color: #333;">${title}</h3>
                <p style="color: #666;">${body}</p>
            </div>
        `;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        appElement.innerHTML = '<p style="color: red;">❌ Không thể tải dữ liệu từ API!</p>';
    }
};

// Gọi hàm chạy khi trang load
document.addEventListener('DOMContentLoaded', fetchSampleData);
