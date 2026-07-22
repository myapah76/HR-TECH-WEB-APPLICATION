package hrtech.application.entities.enums;

/**
 * Trạng thái Vòng đời Tổng thể của Đơn Ứng Tuyển (Macro Application Lifecycle).
 * Quản lý tiến trình tổng từ lúc nộp hồ sơ tới khi Tuyển dụng / Từ chối.
 */
public enum ApplicationStatus {
    SUBMITTED,       // Mới nộp đơn ứng tuyển
    SCORED,          // Đã chấm điểm AI
    CV_REJECTED,     // Từ chối hồ sơ CV sơ tuyển ban đầu
    INTERVIEW,       // Đã duyệt CV -> Đang trong giai đoạn phỏng vấn
    FINAL_ACCEPTED,  // Đã trúng tuyển chính thức (Chấp nhận nhận việc / Offer)
    FINAL_REJECTED,  // Từ chối ở bước duyệt tuyển dụng cuối (Sau phỏng vấn)
    WITHDRAWN        // Ứng viên tự rút đơn
}
