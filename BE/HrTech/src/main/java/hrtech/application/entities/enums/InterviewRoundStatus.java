package hrtech.application.entities.enums;

/**
 * Trạng thái Chi Tiết Từng Vòng Phỏng Vấn (Micro Interview Round & Slot Scheduling Lifecycle).
 * Quản lý quy trình trao đổi slot, chốt giờ, điểm danh và đánh giá từng Vòng (Round 1, Round 2...).
 */
public enum InterviewRoundStatus {
    NOT_STARTED,           // Chưa bắt đầu / Chưa xếp lịch cho vòng này
    SLOTS_SENT,            // HR đã gửi danh sách khung giờ -> Chờ ứng viên chọn
    RESCHEDULE_REQUESTED,  // Ứng viên đề xuất đổi lịch khác kèm lý do
    RESCHEDULE_REJECTED,   // HR từ chối đề xuất đổi lịch & gửi khung giờ thay thế
    CONFIRMED,             // Đã chốt lịch phỏng vấn chính thức
    ATTENDED,              // Ứng viên đã tham gia phỏng vấn / Đã check-in (Chờ chấm điểm)
    PASSED,                // Đã ĐẠT vòng phỏng vấn này
    FAILED,                // KHÔNG ĐẠT vòng phỏng vấn này
    TERMINATED,            // Dừng luồng phỏng vấn do quá 3 lần đổi lịch không thành công
    INTERVIEW_COMPLETED    // Hoàn thành tất cả các vòng phỏng vấn
}
