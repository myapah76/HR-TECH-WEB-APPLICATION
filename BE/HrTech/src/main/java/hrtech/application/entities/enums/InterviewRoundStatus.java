package hrtech.application.entities.enums;

public enum InterviewRoundStatus {
    NOT_STARTED,   // Chưa bắt đầu / Chưa xếp lịch
    SLOTS_SENT,    // Đã gửi danh sách khung giờ -> Chờ ứng viên chọn
    CONFIRMED,     // Đã chốt lịch phỏng vấn chính thức
    RESCHEDULED,   // Ứng viên đề xuất đổi lịch khác
    PASSED,        // Đã ĐẠT vòng phỏng vấn này
    FAILED         // KHÔNG ĐẠT vòng phỏng vấn này
}
