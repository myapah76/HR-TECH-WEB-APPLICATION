package hrtech.application.entities.enums;

/**
 * Trạng thái Vòng đời Tổng thể của Đơn Ứng Tuyển (Macro Application Lifecycle).
 * Quản lý tiến trình tổng từ lúc nộp hồ sơ tới khi Tuyển dụng / Từ chối.
 */
public enum ApplicationStatus {
    SUBMITTED, // Mới nộp đơn ứng tuyển
    SCORED, // Đã chấm điểm AI
    INTERVIEW, // Đang trong giai đoạn phỏng vấn (bao gồm xếp lịch và phỏng vấn các vòng)
    ACCEPTED, // Đã trúng tuyển / Nhận Offer
    REJECTED, // Từ chối hồ sơ ứng tuyển
    WITHDRAWN // Ứng viên tự rút đơn
}
