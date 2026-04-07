# PlanbookAI – Cấu trúc Thư mục Frontend (ReactJS / Vite)

Frontend của dự án được cấu trúc theo dạng Monolithic (Một cục duy nhất) nhưng phân chia rõ ràng theo **Tính năng (Feature)** và **Quyền (Role)** để 6 thành viên dễ dàng code chung mà không đụng file của nhau.

Dự án sử dụng: **ReactJS + Vite + TailwindCSS + React Router DOM + Axios**.

---

## 🌳 Sơ đồ Cây Thư Mục (`frontend-app/`)

```text
d:\XDOPP\planbook-ai\frontend-app\
 ┣ 📂 public/               # File tĩnh (favicon.ico, logo.png...) không qua build process
 ┣ 📂 src/                  # Thư mục làm việc chính của toàn team
 ┃ ┣ 📂 assets/             # Hình ảnh, Fonts, SVG Icons dùng chung
 ┃ ┣ 📂 components/         # Các mảnh ghép UI dùng lại nhiều lần
 ┃ ┃ ┣ 📂 common/           # Component cơ bản: Button, Input, Modal, Table...
 ┃ ┃ ┗ 📂 layouts/          # Khung trang: Sidebar, Header, Footer
 ┃ ┃
 ┃ ┣ 📂 config/             # Cấu hình hệ thống chung
 ┃ ┃ ┗ 📄 axios.js          # Cấu hình Axios Interceptor (Tự động gắn JWT Token Header)
 ┃ ┃
 ┃ ┣ 📂 contexts/           # Quản lý Global State (React Context / Redux / Zustand)
 ┃ ┃ ┗ 📄 AuthContext.jsx   # Quản lý trạng thái Đăng nhập, thông tin User hiện tại
 ┃ ┃
 ┃ ┣ 📂 pages/              # Nơi chứa các màn hình chính (Chia theo ROLE và TÍNH NĂNG)
 ┃ ┃ ┣ 📂 public/           # Các trang không cần đăng nhập
 ┃ ┃ ┃ ┣ 📄 Login.jsx       # Đăng nhập (Task Người 1)
 ┃ ┃ ┃ ┣ 📄 Register.jsx    # Đăng ký (Task Người 1)
 ┃ ┃ ┃ ┗ 📄 Error404.jsx    # Trang báo lỗi không tìm thấy
 ┃ ┃ ┃
 ┃ ┃ ┣ 📂 teacher/          # Màn hình độc quyền cho Role TEACHER
 ┃ ┃ ┃ ┣ 📄 Dashboard.jsx   # Thống kê tổng quan cho giáo viên
 ┃ ┃ ┃ ┣ 📄 LessonPlans.jsx # Quản lý và tạo Giáo án (Task Người 2)
 ┃ ┃ ┃ ┣ 📄 Exams.jsx       # Quản lý và tạo Đề thi (Task Người 4)
 ┃ ┃ ┃ ┗ 📄 Profile.jsx     # Xem/Sửa thông tin cá nhân (Task Người 1)
 ┃ ┃ ┃
 ┃ ┃ ┣ 📂 manager/          # Màn hình quản lý cho Role MANAGER
 ┃ ┃ ┃ ┣ 📄 QuestionApprove.jsx # Xác duyệt câu hỏi từ ngân hàng (Task Người 3)
 ┃ ┃ ┃ ┗ 📄 PackageManage.jsx   # Cấu hình Gói cước / Subscription (Task Người 6)
 ┃ ┃ ┃
 ┃ ┃ ┣ 📂 staff/            # Màn hình vận hành cho Role STAFF
 ┃ ┃ ┃ ┗ 📄 QuestionBank.jsx    # Nhập liệu và quản lý Ngân hàng câu hỏi (Task Người 3)
 ┃ ┃ ┃
 ┃ ┃ ┗ 📂 admin/            # Màn hình quản trị hệ thống cho Role ADMIN
 ┃ ┃   ┗ 📄 UsersManage.jsx     # Tạo tài khoản Manager/Staff nội bộ (Task Người 6)
 ┃ ┃
 ┃ ┣ 📂 routes/             # Định tuyến đường dẫn (React Router)
 ┃ ┃ ┣ 📄 AppRoutes.jsx     # File chứa tất cả <Route />
 ┃ ┃ ┣ 📄 ProtectedRoute.jsx# Hàng rào bảo vệ: Bắt buộc phải có JWT Token mới được vào
 ┃ ┃ ┗ 📄 RoleRoute.jsx     # Hàng rào phân quyền: Phải đúng Role (VD: Teacher ko đc vào trang Admin)
 ┃ ┃
 ┃ ┣ 📄 App.jsx             # Component gốc bao bọc toàn bộ ứng dụng (Chứa các Context Provider)
 ┃ ┣ 📄 main.jsx            # Entry point để render React vào file index.html
 ┃ ┗ 📄 index.css           # Cấu hình TailwindCSS và các Reset CSS cơ bản
 ┃
 ┣ 📄 index.html            # File HTML gốc (Single Page Application)
 ┣ 📄 package.json          # Khai báo biến môi trường, Script chạy và Thư viện phụ thuộc
 ┣ 📄 vite.config.js        # Cấu hình công cụ build Vite
 ┗ 📄 tailwind.config.js    # Cấu hình giao diện, màu sắc, font chữ cho TailwindCSS
```

---

## 🎯 Quy tắc Code Frontend Cần Nhớ
1. **Chia để trị**: Code UI trang bự ở `pages/`, mảng giao diện lặp lại phải tách ra nhét vào `components/`.
2. **Không Style Inline**: CSS phải dùng class của Tailwind (VD: `className="text-red-500 font-bold"`), tuyệt đối hạn chế viết file `.css` riêng lẻ ngoại trừ code reset gốc.
3. **Thống nhất API**: Toàn bộ lời gọi Backend phải import thư viện `axios` từ thư mục `config/axios.js` (đã gắn Token), tuyệt đối không dùng `fetch()` chay.
