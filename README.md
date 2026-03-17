# 🚗 Car Rental System — Frontend

Giao diện người dùng cho hệ thống cho thuê xe, hỗ trợ 4 roles: khách hàng, nhân viên, tài xế và quản lý.

---

## Công nghệ sử dụng

| Công nghệ | Phiên bản | Mô tả |
|---|---|---|
| React | 19.x | UI library |
| Vite | 7.x | Build tool & dev server |
| Tailwind CSS | 4.x | Utility-first CSS |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | Gọi REST API |
| Recharts | 3.x | Biểu đồ báo cáo tài chính |
| React Icons | 5.x | Bộ icon (Material Design...) |
| jwt-decode | 4.x | Giải mã JWT token phía client |
| Lucide React | 0.5x | Icon bổ sung |

---

## Cấu trúc thư mục

```
src/
├── assets/                    # Hình ảnh, video
├── components/
│   ├── common/                # Các component dùng chung
│   ├── layout/                # Header, Footer, Sidebar
│   └── Chatbot/               # Component chatbot AI
├── constants/
│   ├── apiEndpoints.js        # Tất cả API endpoint
│   └── appConstants.js        # Hằng số (roles, status...)
├── context/
│   ├── AuthContext.jsx        # Quản lý đăng nhập / JWT token
│   └── ToastContext.jsx       # Thông báo toast toàn cục
├── hooks/
│   ├── useAuth.js             # Hook lấy thông tin user
│   └── useFetch.js            # Hook gọi API có loading/error
├── pages/
│   ├── Auth/                  # Đăng nhập, đăng ký
│   ├── Home/                  # Trang chủ
│   ├── Vehicles/              # Danh sách xe
│   ├── Booking/               # Form đặt xe 2 bước
│   ├── Payment/               # Kết quả thanh toán VNPay
│   ├── History/               # Lịch sử đặt xe (khách hàng)
│   ├── Profile/               # Hồ sơ cá nhân
│   ├── About/                 # Giới thiệu
│   ├── Manager/               # Dashboard, quản lý xe/tài xế/nhân viên
│   ├── Staff/                 # Quản lý đơn đặt xe (nhân viên)
│   └── Driver/                # Lịch phân công (tài xế)
├── routes/
│   ├── AppRoutes.jsx          # Định nghĩa tất cả routes
│   ├── PrivateRoute.jsx       # Route yêu cầu đăng nhập
│   ├── RoleBasedRoute.jsx     # Route phân quyền theo role
│   └── ProtectedAuthRoute.jsx # Ngăn user đã login vào /login, /register
├── services/api/              # Hàm gọi API từng module
└── utils/
    ├── formatters.js          # Format ngày, tiền tệ...
    └── validators.js          # Validation form
```

---

## Chức năng theo từng Role

### 👤 Khách hàng (Customer)

| Trang | Đường dẫn | Chức năng |
|---|---|---|
| Trang chủ | `/` | Giới thiệu dịch vụ, tìm xe nhanh |
| Danh sách xe | `/vehicles` | Xem và tìm kiếm xe có sẵn |
| Đặt xe | `/booking` | Chọn xe, ngày thuê, loại thuê (tự lái / có tài xế), xác nhận và thanh toán cọc qua VNPay |
| Kết quả thanh toán | `/payment/result` | Hiển thị kết quả sau khi VNPay redirect về |
| Lịch sử đặt xe | `/history` | Theo dõi trạng thái đơn, hủy đơn, thanh toán phần còn lại |
| Hồ sơ | `/profile` | Xem và cập nhật thông tin cá nhân |

### 👨‍💼 Nhân viên (Staff)

| Trang | Đường dẫn | Chức năng |
|---|---|---|
| Dashboard | `/staff/dashboard` | Tổng quan đơn đặt xe |
| Quản lý đơn | `/staff/bookings` | Duyệt cọc, phân công tài xế, xuất xe (upload hợp đồng), tạo link thanh toán còn lại |
| Quản lý xe | `/staff/cars` | Xem danh sách xe |
| Khách hàng | `/staff/customers` | Xem danh sách khách hàng |
| Hồ sơ | `/staff/profile` | Hồ sơ nhân viên |

### 🚘 Tài xế (Driver)

| Trang | Đường dẫn | Chức năng |
|---|---|---|
| Dashboard | `/driver/dashboard` | Tổng quan lịch chạy |
| Lịch phân công | `/driver/schedule` | Xem chuyến được phân công, nhận hoặc từ chối chuyến (tabs: Tất cả / Chờ xác nhận / Đã nhận / Đã từ chối) |
| Hồ sơ | `/driver/profile` | Hồ sơ tài xế |

### 📊 Quản lý (Manager)

| Trang | Đường dẫn | Chức năng |
|---|---|---|
| Dashboard | `/manager/dashboard` | Biểu đồ doanh thu 6 tháng, số lượng đặt xe, phân bổ trạng thái xe, đơn gần đây |
| Quản lý xe | `/manager/vehicles` | CRUD xe |
| Quản lý đơn | `/manager/bookings` | Xem/hủy/xóa tất cả đơn |
| Quản lý tài xế | `/manager/drivers` | CRUD tài xế |
| Quản lý nhân viên | `/manager/staff` | CRUD nhân viên |
| Hồ sơ | `/manager/profile` | Hồ sơ quản lý |

---

## Quy trình thanh toán VNPay

```
Khách chọn xe & ngày
 → Nhấn "Thanh toán cọc" → FE gọi BE tạo VNPay URL
 → Chuyển hướng đến VNPay sandbox
 → Thanh toán thành công/thất bại
 → VNPay redirect về BE (/payment/vnpay/return)
 → BE xác minh → redirect về FE (/payment/result?success=true&...)
 → Hiển thị kết quả, tự động chuyển trang sau 10 giây
```

---

## Cài đặt & Chạy

### Yêu cầu

- Node.js ≥ 18
- Backend API đang chạy (xem README backend)

### 1. Clone & cài dependencies

```bash
git clone https://github.com/SWD392-Group5-CarRentalSystem/Car-Rental-System-Frontend.git
cd Car-Rental-System-Frontend/Front-end
npm install
```

### 2. Cấu hình URL API

Tìm file cấu hình axios trong `src/services/api/` và đảm bảo `baseURL` trỏ đúng backend:

```js
const BASE_URL = 'http://localhost:4000/api/v1';
```

> Khi deploy production, thay bằng URL backend thực tế.

### 3. Chạy development

```bash
npm run dev
```

Ứng dụng chạy tại: `http://localhost:5173`

### 4. Build production

```bash
npm run build
```

Output tại thư mục `dist/`.

### 5. Preview bản build

```bash
npm run preview
```

---

## Deploy lên Vercel (khuyến nghị)

1. Đẩy code lên GitHub
2. Vào [vercel.com](https://vercel.com) → **Add New Project** → Import repo
3. Cấu hình:
   - **Root Directory**: `Front-end`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy → Vercel cấp URL dạng `https://your-app.vercel.app`

> Sau khi có URL Vercel, cập nhật `FRONTEND_URL` trong `.env` backend thành URL đó.

---

## Tài khoản test

| Role | Email | Mật khẩu |
|---|---|---|
| Manager | _(liên hệ admin)_ | — |
| Staff | _(liên hệ admin)_ | — |
| Driver | _(liên hệ admin)_ | — |
| Customer | Tự đăng ký tại `/register` | — |
