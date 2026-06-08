# Kế hoạch & Đặc tả API (REST API Specification)

Tài liệu này đặc tả toàn bộ các endpoints của dự án HR-TECH theo chuẩn RESTful.
Các endpoint này sẽ được đồng bộ lại (Refactor) code backend nhằm đảm bảo tính nhất quán, dễ hiểu và dễ bảo trì.

## 1. Authentication & Authorization (`/api/auth`)
*Chức năng: Quản lý đăng ký, đăng nhập, quên mật khẩu và refresh token.*

| Endpoint | Method | Mô tả (Description) |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Đăng ký tài khoản mới (Ứng viên/Công ty) |
| `/api/auth/login` | `POST` | Đăng nhập và nhận JWT |
| `/api/auth/logout` | `POST` | Đăng xuất |
| `/api/auth/refresh` | `POST` | Refresh JWT Token |
| `/api/auth/forgot-password` | `POST` | Yêu cầu OTP quên mật khẩu |
| `/api/auth/resend-otp` | `POST` | Gửi lại OTP |
| `/api/auth/confirm-otp` | `POST` | Xác thực OTP |
| `/api/auth/reset-password` | `POST` | Đổi mật khẩu mới sau khi xác thực OTP |

## 2. Roles Management (`/api/roles`)
*Chức năng: Quản lý quyền hệ thống.*

| Endpoint | Method | Mô tả (Description) |
| :--- | :--- | :--- |
| `/api/roles` | `POST` | Tạo role mới |
| `/api/roles` | `GET` | Lấy danh sách role |
| `/api/roles/{id}` | `GET` | Lấy role theo ID |
| `/api/roles/name/{name}` | `GET` | Lấy role theo tên |
| `/api/roles/{id}` | `PUT` | Cập nhật role |
| `/api/roles/{id}` | `DELETE` | Xóa role |

## 3. Users Management (`/api/users`)
*Chức năng: Quản lý thông tin người dùng cá nhân (Profile).*

| Endpoint | Method | Mô tả (Description) |
| :--- | :--- | :--- |
| `/api/users/me` | `PUT` | Cập nhật thông tin profile của user hiện tại |
| `/api/users/me/password` | `PUT` | Đổi mật khẩu của user hiện tại |
| `/api/users/{id}` | `GET` | Lấy thông tin user (Admin dùng) |
| `/api/users` | `GET` | Lấy danh sách user (Admin dùng) |
| `/api/users` | `POST` | Tạo user mới (Admin dùng) |
| `/api/users/{id}` | `DELETE` | Xóa user (Admin dùng) |

## 4. CV Management (`/api/cvs`)
*Chức năng: Ứng viên quản lý CV của mình (Upload, đặt làm CV chính).*

| Endpoint | Method | Mô tả (Description) |
| :--- | :--- | :--- |
| `/api/cvs` | `GET` | Lấy danh sách CV của ứng viên hiện tại |
| `/api/cvs` | `POST` | Upload CV mới (multipart/form-data) |
| `/api/cvs/{cvId}` | `GET` | Lấy chi tiết 1 CV của mình |
| `/api/cvs/{cvId}` | `DELETE` | Xóa CV của mình |
| `/api/cvs/{cvId}/primary` | `PUT` | Đặt CV làm CV chính |

## 5. Company Management (`/api/companies`)
*Chức năng: Quản lý thông tin Công ty và Nhân sự trong công ty.*

| Endpoint | Method | Mô tả (Description) |
| :--- | :--- | :--- |
| `/api/companies/register` | `POST` | Đăng ký công ty (multipart/form-data) |
| `/api/companies/{id}` | `GET` | Lấy chi tiết thông tin công ty |
| `/api/companies/{id}` | `PUT` | Cập nhật thông tin công ty |
| `/api/companies/{id}` | `DELETE` | Xóa công ty (Soft delete) |
| `/api/companies/{id}/members` | `GET` | Lấy danh sách nhân viên của công ty |
| `/api/companies/{id}/members` | `POST` | Thêm nhân viên vào công ty |
| `/api/companies/{id}/members/{memberId}` | `DELETE` | Xóa nhân viên khỏi công ty |

## 6. Job Management (`/api/jobs`)
*Chức năng: Quản lý tin tuyển dụng (Tạo, duyệt, đóng, tìm kiếm).*

**6.1 Public / General Jobs (`/api/jobs`)**
| Endpoint | Method | Mô tả (Description) |
| :--- | :--- | :--- |
| `/api/jobs` | `GET` | Tìm kiếm tin tuyển dụng (Public search) |
| `/api/jobs/{id}` | `GET` | Xem chi tiết tin tuyển dụng |
| `/api/jobs` | `POST` | Tạo tin tuyển dụng mới (HR tạo - trạng thái DRAFT) |
| `/api/jobs/{id}` | `PUT` | Cập nhật tin tuyển dụng (Chỉ khi DRAFT) |

**6.2 Trạng thái Job (Dành cho HR Manager & HR) (`/api/jobs`)**
| Endpoint | Method | Mô tả (Description) |
| :--- | :--- | :--- |
| `/api/jobs/{id}/submit` | `PUT` | Nộp job để duyệt (Từ DRAFT -> PENDING) |
| `/api/jobs/{id}/approve` | `PUT` | Duyệt Job (Từ PENDING -> PUBLISHED) |
| `/api/jobs/{id}/reject` | `PUT` | Từ chối Job (Từ PENDING -> REJECTED) |
| `/api/jobs/{id}/close` | `PUT` | Đóng Job (Hết hạn hoặc ngừng tuyển) |

**6.3 View theo Công ty (`/api/companies/{companyId}/jobs`)**
| Endpoint | Method | Mô tả (Description) |
| :--- | :--- | :--- |
| `/api/companies/{companyId}/jobs` | `GET` | Lấy tất cả job của một công ty |
| `/api/companies/{companyId}/jobs/pending` | `GET` | Lấy các job đang chờ duyệt của công ty |
| `/api/companies/{companyId}/jobs/me` | `GET` | Lấy các job do HR (user hiện tại) tạo |

## 7. Admin Endpoints (`/api/admin/*`)
*Chức năng: Admin hệ thống duyệt công ty, quản lý hệ thống.*

| Endpoint | Method | Mô tả (Description) |
| :--- | :--- | :--- |
| `/api/admin/companies/{id}/approve` | `PUT` | Admin duyệt công ty |
| `/api/admin/companies/{id}/reject` | `PUT` | Admin từ chối công ty |
| `/api/admin/companies/{id}` | `DELETE` | Admin xóa công ty |
| `/api/admin/jobs/{id}` | `DELETE` | Admin gỡ Job |

## 8. AI & Skills Graph (`/api/skills`)
*Chức năng: Quản lý cây kỹ năng Neo4j.*

| Endpoint | Method | Mô tả (Description) |
| :--- | :--- | :--- |
| `/api/skills` | `GET` | Danh sách skill (có phân trang) |
| `/api/skills/search` | `GET` | Tìm kiếm skill theo tên (Text search) |
| `/api/skills/{id}` | `GET` | Xem chi tiết skill (gồm các Node liên quan) |
| `/api/skills` | `POST` | Admin tạo Skill Node thủ công |
| `/api/skills/{id}` | `PUT` | Cập nhật thông tin Skill |
| `/api/skills/{id}` | `DELETE` | Xóa Skill |
| `/api/skills/pending` | `GET` | Lấy danh sách Skill chờ Admin duyệt (is_verified = false) |
| `/api/skills/{id}/approve` | `PUT` | Admin duyệt Skill mới (đổi is_verified = true) |
| `/api/skills/{id}/reject` | `DELETE` | Admin từ chối Skill mới (thực hiện xóa node) |

**Relationships**
| Endpoint | Method | Mô tả (Description) |
| :--- | :--- | :--- |
| `/api/skills/relationships/pending` | `GET` | Lấy danh sách quan hệ chờ duyệt |
| `/api/skills/{sourceId}/relationships/{targetId}/approve` | `PUT` | Duyệt quan hệ |
| `/api/skills/{sourceId}/relationships/{targetId}/reject` | `DELETE` | Từ chối quan hệ (thực hiện xóa relationship) |
| `/api/skills/{id}/synonyms/{synonymId}` | `POST` | Tạo quan hệ Synonym |
| `/api/skills/{id}/related/{relatedId}` | `POST` | Tạo quan hệ Related To |
| `/api/skills/{parentId}/children/{childId}` | `POST` | Tạo quan hệ Parent-Child |
| `/api/skills/{id}/related` | `GET` | Lấy danh sách skill liên quan |
| `/api/skills/{id}/similar` | `GET` | Lấy danh sách skill tương đồng (AI Vector Search) |

## 9. AI Recommendations (`/api/recommendations`)
*Chức năng: Gọi AI Matcher / Gợi ý.*

| Endpoint | Method | Mô tả (Description) |
| :--- | :--- | :--- |
| `/api/recommendations/cvs/{cvId}/analyze` | `POST` | Phân tích CV qua AI |
| `/api/recommendations/jobs` | `GET` | Gợi ý việc làm cho Candidate |
| `/api/recommendations/match-score` | `GET` | Chấm điểm độ phù hợp CV - JD |
